import { delay } from "redux-saga";
import { fork, put, select } from "redux-saga/effects";

import { ETxHistoryMessage } from "../../components/translatedMessages/messages";
import { createMessage } from "../../components/translatedMessages/utils";
import { TransactionDetailsModal } from "../../components/wallet/transactions-history/TransactionDetailsModal";
import { TGlobalDependencies } from "../../di/setupBindings";
import {
  TAnalyticsTransaction,
  TAnalyticsTransactionsResponse,
} from "../../lib/api/analytics-api/interfaces";
import { IAppState } from "../../store";
import { actions, TActionFromCreator } from "../actions";
import { neuCall, neuTakeLatest, neuTakeUntil } from "../sagasUtils";
import { TX_LIMIT, TX_POLLING_INTERVAL } from "./constants";
import { selectLastTransactionId, selectTimestampOfLastChange, selectTXById } from "./selectors";
import { TTxHistory } from "./types";
import { mapAnalyticsTransaction } from "./utils";

export function* mapAnalyticsApiTransactionsResponse(
  { logger }: TGlobalDependencies,
  transactions: TAnalyticsTransaction[],
): Iterator<any> {
  return transactions
    .map(transaction => {
      const mappedTransaction = mapAnalyticsTransaction(transaction);
      if (mappedTransaction === undefined) {
        logger.warn(new Error(`Transaction with unknown type received ${transaction.type}`));

        return undefined;
      }
      return mappedTransaction;
    })
    .filter(Boolean);
}

export function* loadTransactionsHistoryNext({
  notificationCenter,
  logger,
  analyticsApi,
}: TGlobalDependencies): Iterator<any> {
  try {
    const lastTransactionId: string | undefined = yield select(selectLastTransactionId);

    const {
      transactions,
      beforeTransaction: newLastTransactionId,
    }: TAnalyticsTransactionsResponse = yield analyticsApi.getTransactionsList(
      TX_LIMIT,
      lastTransactionId,
    );

    const processedTransactions: TTxHistory[] = yield neuCall(
      mapAnalyticsApiTransactionsResponse,
      transactions,
    );

    yield put(actions.txHistory.appendTransactions(processedTransactions, newLastTransactionId));
  } catch (e) {
    notificationCenter.error(createMessage(ETxHistoryMessage.TX_HISTORY_FAILED_TO_LOAD_NEXT));

    logger.error("Error while loading next page of transaction history", e);
  }
}

export function* loadTransactionsHistory({
  notificationCenter,
  logger,
  analyticsApi,
}: TGlobalDependencies): Iterator<any> {
  try {
    const {
      transactions,
      beforeTransaction: lastTransactionId,
      version: newTimestampOfLastChange,
    }: TAnalyticsTransactionsResponse = yield analyticsApi.getTransactionsList(TX_LIMIT);

    const processedTransactions = yield neuCall(mapAnalyticsApiTransactionsResponse, transactions);

    yield put(
      actions.txHistory.setTransactions(
        processedTransactions,
        lastTransactionId,
        newTimestampOfLastChange,
      ),
    );

    yield put(actions.txHistory.startWatchingForNewTransactions());
  } catch (e) {
    notificationCenter.error(createMessage(ETxHistoryMessage.TX_HISTORY_FAILED_TO_LOAD));

    logger.error("Error while loading transaction history", e);

    yield put(actions.txHistory.setTransactions([], undefined, undefined));
  }
}

export function* watchTransactions({ analyticsApi, logger }: TGlobalDependencies): Iterator<any> {
  while (true) {
    yield delay(TX_POLLING_INTERVAL);

    const timestampOfLastChange: number | undefined = yield select(selectTimestampOfLastChange);

    if (timestampOfLastChange === undefined) {
      logger.error(
        new Error("Transaction latest version can't be undefined. Stopping transaction polling"),
      );
      break;
    }

    const {
      version: newTimestampOfLastChange,
      transactions,
      beforeTransaction: lastTransactionId,
    }: TAnalyticsTransactionsResponse = yield analyticsApi.getUpdatedTransactions(
      timestampOfLastChange,
    );

    if (
      newTimestampOfLastChange !== undefined &&
      newTimestampOfLastChange > timestampOfLastChange
    ) {
      const processedTransactions: TTxHistory[] = yield neuCall(
        mapAnalyticsApiTransactionsResponse,
        transactions,
      );

      yield put(
        actions.txHistory.updateTransactions(
          processedTransactions,
          lastTransactionId,
          newTimestampOfLastChange,
        ),
      );
    }
  }
}

function* showTransactionDetails(
  _: TGlobalDependencies,
  action: TActionFromCreator<typeof actions.txHistory.showTransactionDetails>,
): Iterator<any> {
  const transaction = yield select((state: IAppState) => selectTXById(action.payload.id, state));

  if (!transaction) {
    throw new Error(`Transaction should be defined for ${action.payload.id}`);
  }

  yield put(
    actions.genericModal.showModal(TransactionDetailsModal, {
      transaction,
    }),
  );
}

export function* txHistorySaga(): Iterator<any> {
  yield fork(neuTakeLatest, actions.txHistory.loadTransactions, loadTransactionsHistory);
  yield fork(neuTakeLatest, actions.txHistory.loadNextTransactions, loadTransactionsHistoryNext);
  yield fork(neuTakeLatest, actions.txHistory.showTransactionDetails, showTransactionDetails);
  yield fork(
    neuTakeUntil,
    actions.txHistory.startWatchingForNewTransactions,
    actions.txHistory.stopWatchingForNewTransactions,
    watchTransactions,
  );
}
