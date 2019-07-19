import { fork, put, select } from "redux-saga/effects";

import {
  ECurrency,
  ENumberInputFormat,
  ERoundingMode,
  selectDecimalPlaces,
  toFixedPrecision,
} from "../../../components/shared/formatters/utils";
import { Q18 } from "../../../config/constants";
import { TGlobalDependencies } from "../../../di/setupBindings";
import { ITxData } from "../../../lib/web3/types";
import { NotEnoughEtherForGasError } from "../../../lib/web3/Web3Adapter";
import {
  compareBigNumbers,
  multiplyBigNumbers,
  subtractBigNumbers,
} from "../../../utils/BigNumberUtils";
import { convertToBigInt } from "../../../utils/Number.utils";
import { actions, TAction } from "../../actions";
import { neuCall, neuDebounce } from "../../sagasUtils";
import {
  selectEtherBalance,
  selectLiquidEtherBalance,
  selectMaxAvailableEther,
} from "../../wallet/selectors";
import { EValidationState } from "../sender/reducer";
import { generateInvestmentTransaction } from "../transactions/investment/sagas";
import { generateEthWithdrawTransaction } from "../transactions/withdraw/sagas";
import { EAdditionalValidationDataWarning, ETxSenderType, IDraftType } from "../types";

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
  const additionalVerificationData = yield neuCall(txProcessAdditionalData, action.payload);

  try {
    generatedTxDetails = yield neuCall(validationGenerator, action.payload);

    yield validateGas(generatedTxDetails as ITxData);
    yield put(actions.txValidator.setValidationState(EValidationState.VALIDATION_OK));
    yield put(actions.txSender.setTransactionData(generatedTxDetails));

    yield put(actions.txSender.setAdditionalData(additionalVerificationData));
  } catch (error) {
    if (
      additionalVerificationData &&
      additionalVerificationData.warnings.includes(
        EAdditionalValidationDataWarning.IS_SMART_CONTRACT,
      )
    ) {
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
  { web3Manager }: TGlobalDependencies,
  payload: IDraftType,
): Iterator<any> {
  // Process additional data for withdrawal transaction

  if (payload.type === ETxSenderType.WITHDRAW) {
    const transactionsCount = yield web3Manager.internalWeb3Adapter.getTransactionCount(payload.to);
    const isSmartContract = yield web3Manager.internalWeb3Adapter.isSmartContract(payload.to);
    const maxEther = yield select(selectMaxAvailableEther);
    const allEther = yield select(selectLiquidEtherBalance);
    const newAddress = transactionsCount === 0;

    const maxEtherFixed = toFixedPrecision({
      value: maxEther,
      decimalPlaces: selectDecimalPlaces(ECurrency.ETH),
      inputFormat: ENumberInputFormat.ULPS,
      roundingMode: ERoundingMode.DOWN,
    });

    let warnings: EAdditionalValidationDataWarning[] = [];

    if (isSmartContract) {
      warnings.push(EAdditionalValidationDataWarning.IS_SMART_CONTRACT);
    } else if (newAddress) {
      warnings.push(EAdditionalValidationDataWarning.IS_NEW_ADDRESS);
    }

    try {
      const { gas, gasPrice }: ITxData = yield neuCall(generateEthWithdrawTransaction, {
        ...payload,
        value: maxEtherFixed,
      });

      const maximumCost = multiplyBigNumbers([gasPrice, gas]);
      const maximumAvailableEther = subtractBigNumbers([allEther, maximumCost]);

      const maxAvailableEtherFixed = toFixedPrecision({
        value: maximumAvailableEther,
        decimalPlaces: selectDecimalPlaces(ECurrency.ETH),
        inputFormat: ENumberInputFormat.ULPS,
        roundingMode: ERoundingMode.DOWN,
      });

      if (
        compareBigNumbers(
          convertToBigInt(payload.value || "0"),
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
  yield fork(neuDebounce, 300, "TX_SENDER_VALIDATE_DRAFT", txValidateSaga);
};
