import BigNumber from "bignumber.js";
import { put, select, take } from "redux-saga/effects";

import { TGlobalDependencies } from "../../../../di/setupBindings";
import { ITxData } from "../../../../lib/web3/types";
import { DeepReadonly } from "../../../../types";
import { actions } from "../../../actions";
import { calculateRedeemData } from "../../../bank-transfer-flow/sagas";
import { ICalculatedRedeemData } from "../../../bank-transfer-flow/types";
import { selectStandardGasPriceWithOverHead } from "../../../gas/selectors";
import { selectBankAccount } from "../../../kyc/selectors";
import { TBankAccount } from "../../../kyc/types";
import { neuCall } from "../../../sagasUtils";
import { selectEthereumAddressWithChecksum } from "../../../web3/selectors";
import { ETxSenderType } from "../../types";

export function* generateNeuWithdrawTransaction(
  { contractsService, web3Manager }: TGlobalDependencies,
  amount: string,
): any {
  const from: string = yield select(selectEthereumAddressWithChecksum);
  const gasPriceWithOverhead = yield select(selectStandardGasPriceWithOverHead);

  const txInput = contractsService.euroToken.withdrawTx(new BigNumber(amount)).getData();

  const txDetails: Partial<ITxData> = {
    to: contractsService.euroToken.address,
    from,
    data: txInput,
    value: "0",
    gasPrice: gasPriceWithOverhead,
  };
  const estimatedGasWithOverhead = yield web3Manager.estimateGasWithOverhead(txDetails);
  return { ...txDetails, gas: estimatedGasWithOverhead };
}

export function* startNEuroRedeemGenerator(_: TGlobalDependencies): any {
  // Wait for withdraw confirmation
  const action = yield take(actions.txSender.txSenderAcceptDraft);
  const txDataFromUser = action.payload.txDraftData;
  const selectedAmount = txDataFromUser.value;

  // For security reasons calculate again with value submited by formik
  const {
    amountUlps,
    bankFee,
    totalRedeemed,
    amount,
  }: ICalculatedRedeemData = yield calculateRedeemData(selectedAmount);

  const generatedTxDetails: ITxData = yield neuCall(generateNeuWithdrawTransaction, amountUlps);

  yield put(actions.txSender.setTransactionData(generatedTxDetails));

  const bankAccount: DeepReadonly<TBankAccount> = yield select(selectBankAccount);
  if (!bankAccount.hasBankAccount) {
    throw new Error("During redeem process user should have bank account");
  }

  const additionalDetails = {
    bankFee,
    amount,
    totalRedeemed,
    bankAccount: {
      bankName: bankAccount.details.bankName,
      accountNumberLast4: bankAccount.details.bankAccountNumberLast4,
    },
  };

  yield put(
    actions.txSender.txSenderContinueToSummary<ETxSenderType.NEUR_REDEEM>(additionalDetails),
  );
}
