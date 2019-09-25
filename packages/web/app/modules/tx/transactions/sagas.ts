import { fork, put, select, take } from "redux-saga/effects";

import { TGlobalDependencies } from "../../../di/setupBindings";
import { actions, TAction, TActionFromCreator } from "../../actions";
import { EBankTransferType } from "../../bank-transfer-flow/reducer";
import { selectIsBankAccountVerified } from "../../bank-transfer-flow/selectors";
import { etoFlowActions } from "../../eto-flow/actions";
import { onInvestmentTxModalHide } from "../../investment-flow/sagas";
import { neuCall, neuTakeLatest } from "../../sagasUtils";
import { deletePendingTransaction } from "../monitor/sagas";
import { ITxSendParams, txSendSaga } from "../sender/sagas";
import { ETxSenderType } from "../types";
import { startClaimGenerator } from "./claim/saga";
import { etoSetDateGenerator, etoSignInvestmentAgreementGenerator } from "./eto-flow/saga";
import { investmentFlowGenerator } from "./investment/sagas";
import { startNomineeAgreementSign } from "./nominee/sign-agreement/saga";
import { startInvestorPayoutAcceptGenerator } from "./payout/accept/saga";
import { startInvestorPayoutRedistributionGenerator } from "./payout/redistribute/saga";
import { startNEuroRedeemGenerator } from "./redeem/saga";
import { startRefundGenerator } from "./refund/saga";
import { unlockEtherFundsTransactionGenerator } from "./unlock/sagas";
import { upgradeTransactionFlow } from "./upgrade/sagas";
import { ethWithdrawFlow } from "./withdraw/sagas";

export function* withdrawSaga({ logger }: TGlobalDependencies): Iterator<any> {
  try {
    yield txSendSaga({
      type: ETxSenderType.WITHDRAW,
      transactionFlowGenerator: ethWithdrawFlow,
    });
    logger.info("Withdrawing successful");
  } catch (e) {
    logger.info("Withdrawing cancelled", e);
  }
}

export function* upgradeSaga({ logger }: TGlobalDependencies, action: TAction): Iterator<any> {
  try {
    if (action.type !== "TRANSACTIONS_START_UPGRADE") return;

    const tokenType = action.payload;
    const params: ITxSendParams = {
      type: ETxSenderType.UPGRADE,
      transactionFlowGenerator: upgradeTransactionFlow,
      extraParam: tokenType,
    };
    yield txSendSaga(params);

    logger.info("Upgrading successful");
  } catch (e) {
    logger.info("Upgrading cancelled", e);
  }
}

export function* investSaga({ logger }: TGlobalDependencies): Iterator<any> {
  try {
    yield txSendSaga({
      type: ETxSenderType.INVEST,
      transactionFlowGenerator: investmentFlowGenerator,
    });
    logger.info("Investment successful");
  } catch (e) {
    // Add clean up functions here ...
    yield onInvestmentTxModalHide();
    logger.info("Investment cancelled", e);
  }
}

export function* userClaimSaga({ logger }: TGlobalDependencies, action: TAction): Iterator<any> {
  if (action.type !== "TRANSACTIONS_START_CLAIM") return;
  const etoId = action.payload;
  try {
    yield txSendSaga({
      type: ETxSenderType.USER_CLAIM,
      transactionFlowGenerator: startClaimGenerator,
      extraParam: etoId,
    });
    logger.info("User claim successful");
  } catch (e) {
    logger.info("User claim cancelled", e);
  } finally {
    yield put(actions.eto.loadEto(etoId));
    yield put(actions.eto.loadTokensData());
  }
}

export function* investorPayoutAcceptSaga(
  { logger }: TGlobalDependencies,
  action: TActionFromCreator<typeof actions.txTransactions.startInvestorPayoutAccept>,
): Iterator<any> {
  const tokensDisbursals = action.payload.tokensDisbursals;

  try {
    yield txSendSaga({
      type: ETxSenderType.INVESTOR_ACCEPT_PAYOUT,
      transactionFlowGenerator: startInvestorPayoutAcceptGenerator,
      extraParam: tokensDisbursals,
    });

    logger.info("Investor payout accept successful");
  } catch (e) {
    logger.info("Investor payout accept cancelled", e);
  } finally {
    yield put(actions.investorEtoTicket.loadClaimables());
  }
}

export function* investorPayoutRedistributeSaga(
  { logger }: TGlobalDependencies,
  action: TActionFromCreator<typeof actions.txTransactions.startInvestorPayoutRedistribute>,
): Iterator<any> {
  const tokenDisbursals = action.payload.tokenDisbursals;

  try {
    yield txSendSaga({
      type: ETxSenderType.INVESTOR_REDISTRIBUTE_PAYOUT,
      transactionFlowGenerator: startInvestorPayoutRedistributionGenerator,
      extraParam: tokenDisbursals,
    });

    logger.info("Investor payout redistribution successful");
  } catch (e) {
    logger.info("Investor payout redistribution cancelled", e);
  } finally {
    yield put(actions.investorEtoTicket.loadClaimables());
  }
}

export function* etoSetDateSaga({ logger }: TGlobalDependencies): Iterator<any> {
  try {
    yield put(actions.etoFlow.setEtoDateStart());

    yield txSendSaga({
      type: ETxSenderType.ETO_SET_DATE,
      transactionFlowGenerator: etoSetDateGenerator,
    });
    logger.info("Setting ETO date successful");
  } catch (e) {
    logger.info("Setting ETO date cancelled", e);
    yield put(actions.etoFlow.setEtoDateStop());
  }
}

export function* unlockEtherFunds({ logger }: TGlobalDependencies): Iterator<any> {
  try {
    yield take("WALLET_SAVE_WALLET_DATA");
    // This saga is generated by entering link we need to wait for the wallet to load
    yield txSendSaga({
      type: ETxSenderType.UNLOCK_FUNDS,
      transactionFlowGenerator: unlockEtherFundsTransactionGenerator,
    });
    logger.info("Unlock Ether Funds successful");
  } catch (e) {
    logger.info("Unlock Ether Funds cancelled", e);
  }
}

export function* neurRedeemSaga({ logger }: TGlobalDependencies): Iterator<any> {
  const isVerified: boolean = yield select(selectIsBankAccountVerified);

  if (!isVerified) {
    yield put(actions.bankTransferFlow.startBankTransfer(EBankTransferType.VERIFY));
    return;
  }

  try {
    yield txSendSaga({
      type: ETxSenderType.NEUR_REDEEM,
      transactionFlowGenerator: startNEuroRedeemGenerator,
    });

    logger.info("Investor nEUR withdrawal successful");
  } catch (e) {
    logger.info("Investor nEUR withdrawal cancelled", e);
  }
}

export function* etoSignInvestmentAgreementSaga(
  { logger }: TGlobalDependencies,
  action: TActionFromCreator<typeof actions.etoFlow.signInvestmentAgreement>,
): Iterator<any> {
  try {
    yield txSendSaga({
      type: ETxSenderType.SIGN_INVESTMENT_AGREEMENT,
      transactionFlowGenerator: etoSignInvestmentAgreementGenerator,
      extraParam: action.payload,
    });
    logger.info("Signing investment agreement was successful");
  } catch (e) {
    logger.info("Signing investment agreement was cancelled", e);
  } finally {
    yield put(actions.etoFlow.loadSignedInvestmentAgreement(action.payload.etoId));
  }
}

export function* removePendingTransaction({ logger }: TGlobalDependencies): Iterator<any> {
  try {
    // call delete transaction saga
    yield neuCall(deletePendingTransaction);

    logger.info("Pending transaction has been deleted");
  } catch (e) {
    logger.error(new Error("Unable to delete pending transaction"));
  } finally {
    yield put(actions.txSender.txSenderHideModal());
  }
}

export function* etoRefundSaga(
  { logger }: TGlobalDependencies,
  action: TActionFromCreator<typeof actions.txTransactions.startInvestorRefund>,
): Iterator<any> {
  const etoId = action.payload.etoId;
  try {
    yield txSendSaga({
      type: ETxSenderType.INVESTOR_REFUND,
      transactionFlowGenerator: startRefundGenerator,
      extraParam: etoId,
    });
    logger.info("User refund successful");
  } catch (e) {
    logger.info("User refund cancelled", e);
  } finally {
    yield put(actions.eto.loadEto(etoId));
  }
}

export function* startNomineeTHASignSaga({ logger }: TGlobalDependencies): Iterator<any> {
  try {
    yield txSendSaga({
      type: ETxSenderType.NOMINEE_THA_SIGN,
      transactionFlowGenerator: startNomineeAgreementSign,
    });
    logger.info("THA sign successful");
  } catch (e) {
    logger.info("THA sign cancelled", e);
  } finally {
    yield put(actions.nomineeFlow.loadNomineeTaskData());
  }
}

export function* startNomineeRAAASignSaga({ logger }: TGlobalDependencies): Iterator<any> {
  try {
    yield txSendSaga({
      type: ETxSenderType.NOMINEE_RAAA_SIGN,
      transactionFlowGenerator: startNomineeAgreementSign,
    });
    logger.info("RAAA sign successful");
  } catch (e) {
    logger.info("RAAA sign cancelled", e);
  } finally {
    yield put(actions.nomineeFlow.loadNomineeTaskData());
  }
}

export const txTransactionsSagasWatcher = function*(): Iterator<any> {
  yield fork(neuTakeLatest, "TRANSACTIONS_START_WITHDRAW_ETH", withdrawSaga);
  yield fork(neuTakeLatest, "TRANSACTIONS_START_UPGRADE", upgradeSaga);
  yield fork(neuTakeLatest, "TRANSACTIONS_START_INVESTMENT", investSaga);
  yield fork(neuTakeLatest, "TRANSACTIONS_START_ETO_SET_DATE", etoSetDateSaga);
  yield fork(neuTakeLatest, "TRANSACTIONS_START_CLAIM", userClaimSaga);
  yield fork(neuTakeLatest, actions.txTransactions.startUnlockEtherFunds, unlockEtherFunds);
  yield fork(
    neuTakeLatest,
    actions.txTransactions.startInvestorPayoutAccept,
    investorPayoutAcceptSaga,
  );
  yield fork(
    neuTakeLatest,
    actions.txTransactions.startInvestorPayoutRedistribute,
    investorPayoutRedistributeSaga,
  );
  yield fork(neuTakeLatest, actions.txTransactions.startWithdrawNEuro, neurRedeemSaga);
  yield fork(neuTakeLatest, etoFlowActions.signInvestmentAgreement, etoSignInvestmentAgreementSaga);
  yield fork(
    neuTakeLatest,
    actions.txTransactions.deletePendingTransaction,
    removePendingTransaction,
  );
  yield fork(neuTakeLatest, actions.txTransactions.startInvestorRefund, etoRefundSaga);
  yield fork(neuTakeLatest, actions.txTransactions.startNomineeTHASign, startNomineeTHASignSaga);
  yield fork(neuTakeLatest, actions.txTransactions.startNomineeRAAASign, startNomineeRAAASignSaga);

  // Add new transaction types here...
};
