import BigNumber from "bignumber.js";
import { put, select, take } from "redux-saga/effects";

import { convertFromUlps } from "../../../../components/shared/formatters/utils";
import { MONEY_DECIMALS } from "../../../../config/constants";
import { TGlobalDependencies } from "../../../../di/setupBindings";
import { ITxData } from "../../../../lib/web3/types";
import { DeepReadonly } from "../../../../types";
import { getPossibleMaxUlps } from "../../../../utils/Number.utils";
import { actions } from "../../../actions";
import { selectRedeemFeeUlps } from "../../../bank-transfer-flow/selectors";
import { selectStandardGasPriceWithOverHead } from "../../../gas/selectors";
import { selectBankAccount } from "../../../kyc/selectors";
import { TBankAccount } from "../../../kyc/types";
import { neuCall } from "../../../sagasUtils";
import { selectLiquidEuroTokenBalance } from "../../../wallet/selectors";
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

  const nEURBalanceUlps = yield select(selectLiquidEuroTokenBalance);

  // Whole precision number should be passed when there is whole balance redeemed
  // also when user provided value has been used, then it have to be converted to Q18 via convertToBigInt
  const redeemAmountUlps = getPossibleMaxUlps(nEURBalanceUlps, selectedAmount, 2);

  const generatedTxDetails: ITxData = yield neuCall(
    generateNeuWithdrawTransaction,
    redeemAmountUlps,
  );

  yield put(actions.txSender.setTransactionData(generatedTxDetails));

  const bankAccount: DeepReadonly<TBankAccount> = yield select(selectBankAccount);
  if (!bankAccount.hasBankAccount) {
    throw new Error("During redeem process user should have bank account");
  }

  const bankFee: string = yield select(selectRedeemFeeUlps);

  const additionalDetails = {
    bankFee,
    amount: convertFromUlps(new BigNumber(redeemAmountUlps), MONEY_DECIMALS).toString(),
    bankAccount: {
      bankName: bankAccount.details.bankName,
      accountNumberLast4: bankAccount.details.bankAccountNumberLast4,
    },
  };

  yield put(
    actions.txSender.txSenderContinueToSummary<ETxSenderType.NEUR_REDEEM>(additionalDetails),
  );
}
