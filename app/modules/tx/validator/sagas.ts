import { fork, put, select } from "redux-saga/effects";

import { Q18 } from "../../../config/constants";
import { TGlobalDependencies } from "../../../di/setupBindings";
import { ITxData } from "../../../lib/web3/types";
import { NotEnoughEtherForGasError } from "../../../lib/web3/Web3Adapter";
import {
  compareBigNumbers,
  multiplyBigNumbers,
  subtractBigNumbers,
} from "../../../utils/BigNumberUtils";
import { actions, TAction } from "../../actions";
import { neuCall, neuDebounce } from "../../sagasUtils";
import { selectEtherBalance, selectMaxAvailableEther } from "../../wallet/selectors";
import { doesUserHaveEnoughEther } from "../../web3/utils";
import { EValidationState } from "../sender/reducer";
import { generateInvestmentTransaction } from "../transactions/investment/sagas";
import { generateEthWithdrawTransaction } from "../transactions/withdraw/sagas";
import { EAdditionalValidationDataWarrning, ETxSenderType, IDraftType } from "../types";

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
      additionalVerificationData.warning === EAdditionalValidationDataWarrning.IS_SMART_CONTRACT
    ) {
      yield put(
        actions.txSender.setAdditionalData({
          warning: EAdditionalValidationDataWarrning.IS_NOT_ACCEPTING_ETHER,
        }),
      );
      return;
    }

    if (error instanceof NotEnoughEtherForGasError) {
      logger.info(error);
      yield put(
        actions.txSender.setAdditionalData({
          warning: EAdditionalValidationDataWarrning.IS_NOT_ENOUGH_ETHER,
        }),
      );
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
): any {
  // Process additional data for withdrawal transaction

  if (payload.type === ETxSenderType.WITHDRAW) {
    const transactionsCount = yield web3Manager.internalWeb3Adapter.getTransactionCount(payload.to);
    const isSmartContract = yield web3Manager.internalWeb3Adapter.isSmartContract(payload.to);
    const maxEther = yield select(selectMaxAvailableEther);
    const isEnoughEther = doesUserHaveEnoughEther(payload.value, maxEther);
    const newAddress = transactionsCount === 0;

    let warning: EAdditionalValidationDataWarrning | undefined = undefined;

    if (!isEnoughEther) {
      warning = EAdditionalValidationDataWarrning.IS_NOT_ENOUGH_ETHER;
    } else if (isSmartContract) {
      warning = EAdditionalValidationDataWarrning.IS_SMART_CONTRACT;
    } else if (newAddress) {
      warning = EAdditionalValidationDataWarrning.IS_NEW_ADDRESS;
    }

    return {
      warning,
      inputValue: Q18.mul(payload.value).toString(), // use WEI formatted value
      isAccepted: newAddress || isSmartContract ? false : undefined,
    };
  }
}

export const txValidatorSagasWatcher = function*(): Iterator<any> {
  yield fork(neuDebounce, 300, "TX_SENDER_VALIDATE_DRAFT", txValidateSaga);
};
