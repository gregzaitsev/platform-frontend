import { all, fork, put, select } from "redux-saga/effects";

import { IWindowWithData } from "../../../../test/helperTypes";
import {
  ECurrency,
  ENumberInputFormat,
  ENumberOutputFormat,
  ERoundingMode,
  selectDecimalPlaces,
  toFixedPrecision,
} from "../../../components/shared/formatters/utils";
import { Q18 } from "../../../config/constants";
import { TGlobalDependencies } from "../../../di/setupBindings";
import { IdentityRegistry } from "../../../lib/contracts/IdentityRegistry";
import { ITxData } from "../../../lib/web3/types";
import { NotEnoughEtherForGasError } from "../../../lib/web3/Web3Adapter";
import {
  addBigNumbers,
  compareBigNumbers,
  multiplyBigNumbers,
  subtractBigNumbers,
} from "../../../utils/BigNumberUtils";
import { convertToBigInt } from "../../../utils/Number.utils";
import { actions, TAction } from "../../actions";
import { deserializeClaims } from "../../kyc/utils";
import { neuCall, neuDebounce } from "../../sagasUtils";
import { selectEtherBalance, selectLiquidEtherBalance } from "../../wallet/selectors";
import { validateAddress } from "../../web3/utils";
import { EValidationState } from "../sender/reducer";
import { generateInvestmentTransaction } from "../transactions/investment/sagas";
import { generateEthWithdrawTransaction } from "../transactions/withdraw/sagas";
import { EAdditionalValidationDataWarning, ETxSenderType, IDraftType } from "../types";
import { ETH_ADDRESS_SIZE, MINIMUM_ETH_RESERVE_GAS_UNITS } from "../utils";

export function* txValidateSaga({ logger }: TGlobalDependencies, action: TAction): any {
  if (action.type !== "TX_SENDER_VALIDATE_DRAFT") return;
  // reset validation
  yield put(actions.txValidator.setValidationState());

  let validationGenerator: any;
  switch (action.payload.type) {
    case ETxSenderType.WITHDRAW:
      validationGenerator = generateEthWithdrawTransaction;
      break;
    case ETxSenderType.INVEST:
      validationGenerator = generateInvestmentTransaction;
      break;
  }

  let generatedTxDetails: ITxData | undefined;

  // Do not perform any action if address is not provided or value is not a positive number
  if (
    action.payload.type === ETxSenderType.WITHDRAW &&
    (!action.payload.to ||
      action.payload.to.length !== ETH_ADDRESS_SIZE ||
      !validateAddress(action.payload.to) ||
      !Number(action.payload.value))
  ) {
    return;
  }

  const additionalVerificationData = yield neuCall(txProcessAdditionalData, action.payload);

  try {
    generatedTxDetails = yield neuCall(validationGenerator, action.payload);
    yield put(actions.txSender.setAdditionalData(additionalVerificationData));

    yield validateGas(generatedTxDetails as ITxData);

    yield put(actions.txValidator.setValidationState(EValidationState.VALIDATION_OK));

    yield put(actions.txSender.setTransactionData(generatedTxDetails));
  } catch (error) {
    if (
      additionalVerificationData &&
      additionalVerificationData.warnings.includes(
        EAdditionalValidationDataWarning.IS_SMART_CONTRACT,
      )
    ) {
      if (process.env.IS_CYPRESS) {
        const { disableNotAcceptingEtherCheck } = window as IWindowWithData;
        if (disableNotAcceptingEtherCheck) {
          yield put(actions.txValidator.setValidationState(EValidationState.VALIDATION_OK));
          yield put(actions.txSender.setTransactionData(generatedTxDetails));

          yield put(actions.txSender.setAdditionalData(additionalVerificationData));

          return generatedTxDetails;
        }
      }

      yield put(actions.txValidator.setValidationState(EValidationState.IS_NOT_ACCEPTING_ETHER));
      return;
    }

    if (error instanceof NotEnoughEtherForGasError) {
      logger.info(error);

      yield put(actions.txValidator.setValidationState(EValidationState.NOT_ENOUGH_ETHER_FOR_GAS));
    } else {
      logger.error(error);
    }
  }

  return generatedTxDetails;
}

export function* validateGas(txDetails: ITxData): any {
  const etherBalance: string | undefined = yield select(selectEtherBalance);
  if (!etherBalance) {
    throw new Error("Ether Balance is undefined");
  }
  if (
    compareBigNumbers(
      multiplyBigNumbers([txDetails.gasPrice, txDetails.gas]),
      subtractBigNumbers([etherBalance, txDetails.value.toString()]),
    ) > 0
  ) {
    throw new NotEnoughEtherForGasError("Not enough Ether to pay the Gas for this transaction");
  }
}

export function* txProcessAdditionalData(
  { web3Manager, contractsService }: TGlobalDependencies,
  payload: IDraftType,
): Iterator<any> {
  // Process additional data for withdrawal transaction

  if (payload.type === ETxSenderType.WITHDRAW) {
    const identityRegistry: IdentityRegistry = contractsService.identityRegistry;

    const { claims, transactionsCount, addressBalance, isSmartContract, allEther } = yield all({
      claims: yield identityRegistry.getClaims(payload.to),
      transactionsCount: yield web3Manager.internalWeb3Adapter.getTransactionCount(payload.to),
      addressBalance: yield web3Manager.internalWeb3Adapter.getBalance(payload.to),
      isSmartContract: yield web3Manager.internalWeb3Adapter.isSmartContract(payload.to),
      allEther: yield select(selectLiquidEtherBalance),
    });

    const deserializedClaims = deserializeClaims(claims);

    const newAddress = transactionsCount === 0;

    const maxEtherFixed = toFixedPrecision({
      value: allEther,
      decimalPlaces: selectDecimalPlaces(ECurrency.ETH),
      inputFormat: ENumberInputFormat.ULPS,
      roundingMode: ERoundingMode.UP,
      outputFormat: ENumberOutputFormat.FULL,
    });

    let warnings: EAdditionalValidationDataWarning[] = [];

    // Use only first warning that can be applied
    if (isSmartContract) {
      warnings.push(EAdditionalValidationDataWarning.IS_SMART_CONTRACT);
    } else if (deserializedClaims.isVerified && !deserializedClaims.isAccountFrozen) {
      warnings.push(EAdditionalValidationDataWarning.IS_VERIFIED_PLATFORM_USER);
    } else if (newAddress && addressBalance.toString() === "0") {
      warnings.push(EAdditionalValidationDataWarning.IS_NEW_ADDRESS);
    } else if (newAddress) {
      warnings.push(EAdditionalValidationDataWarning.IS_NEW_ADDRESS_WITH_BALANCE);
    }

    try {
      const { gas, gasPrice }: ITxData = yield neuCall(
        generateEthWithdrawTransaction,
        {
          ...payload,
          value: maxEtherFixed,
        },
        true,
      );

      const requiredGasReserve = multiplyBigNumbers([gasPrice, MINIMUM_ETH_RESERVE_GAS_UNITS]);
      const maximumCost = multiplyBigNumbers([gasPrice, gas]);
      const maximumAvailableEther = subtractBigNumbers([allEther, maximumCost]);

      const maxAvailableEtherFixed = toFixedPrecision({
        value: maximumAvailableEther,
        decimalPlaces: selectDecimalPlaces(ECurrency.ETH),
        inputFormat: ENumberInputFormat.ULPS,
        roundingMode: ERoundingMode.DOWN,
      });

      // Do not validate if value is not valid number
      if (
        !isNaN(Number(payload.value)) &&
        compareBigNumbers(
          addBigNumbers([convertToBigInt(payload.value || "0"), requiredGasReserve]),
          convertToBigInt(maxAvailableEtherFixed),
        ) >= 0
      ) {
        warnings.push(EAdditionalValidationDataWarning.WILL_EMPTY_WALLET);
      }

      return {
        warnings,
        inputValue: Q18.mul(payload.value).toString(), // use WEI formatted value
        maximumAvailableEther: maximumAvailableEther.toString(),
      };
    } catch (error) {
      return {
        warnings,
        inputValue: Q18.mul(payload.value).toString(), // use WEI formatted value
        maximumAvailableEther: "0",
      };
    }
  }
}

export const txValidatorSagasWatcher = function*(): Iterator<any> {
  yield fork(neuDebounce, 500, "TX_SENDER_VALIDATE_DRAFT", txValidateSaga);
};
