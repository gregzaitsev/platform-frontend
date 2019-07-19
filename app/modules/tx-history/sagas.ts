import { delay } from "redux-saga";
import { all, fork, put, select } from "redux-saga/effects";

import { ECurrency, EquityToken } from "../../components/shared/formatters/utils";
import { ETxHistoryMessage } from "../../components/translatedMessages/messages";
import { createMessage } from "../../components/translatedMessages/utils";
import { TransactionDetailsModal } from "../../components/wallet/transactions-history/TransactionDetailsModal";
import { TGlobalDependencies } from "../../di/setupBindings";
import {
  ETransactionType,
  TAnalyticsTransaction,
  TAnalyticsTransactionsResponse,
} from "../../lib/api/analytics-api/interfaces";
import { IAppState } from "../../store";
import { actions, TActionFromCreator } from "../actions";
import { neuCall, neuTakeLatest, neuTakeUntil } from "../sagasUtils";
import { selectEurEquivalent } from "../shared/tokenPrice/selectors";
import { TX_LIMIT, TX_POLLING_INTERVAL } from "./constants";
import { selectLastTransactionId, selectTimestampOfLastChange, selectTXById } from "./selectors";
import { ETransactionSubType, TTxHistory } from "./types";
import { getCurrencyFromTokenSymbol, getDecimalsFormat, getTxUniqueId } from "./utils";

export function* mapAnalyticsApiTransactionResponse(
  { logger }: TGlobalDependencies,
  transaction: TAnalyticsTransaction,
): Iterator<any> {
  const common = {
    date: transaction.blockTime,
    txHash: transaction.txHash,
    transactionDirection: transaction.transactionDirection,
    id: getTxUniqueId(transaction),
    amount: transaction.extraData.amount.toString(),
    amountFormat: getDecimalsFormat(transaction.extraData.tokenMetadata),
    subType: undefined,
  };

  let tx: TTxHistory | undefined = undefined;

  switch (transaction.type) {
    case ETransactionType.ETO_INVESTMENT:
    case ETransactionType.ETO_REFUND: {
      if (!transaction.extraData.assetTokenMetadata || !transaction.extraData.tokenMetadata) {
        throw new Error("Invalid asset token metadata");
      }

      tx = {
        ...common,
        type: transaction.type,
        // TODO: Remove non-null assertion operator after `ETO_REFUND` is fixed on a backend
        // see https://github.com/Neufund/platform-backend/pull/1874
        companyName: transaction.extraData.assetTokenMetadata.companyName!,
        currency: getCurrencyFromTokenSymbol(transaction.extraData.tokenMetadata),
      };
      break;
    }
    case ETransactionType.TRANSFER: {
      // In case it's an equity token transaction
      if (transaction.extraData.tokenInterface === "equityTokenInterface") {
        tx = {
          ...common,
          type: transaction.type,
          subType: ETransactionSubType.TRANSFER_EQUITY_TOKEN,
          currency: transaction.extraData.tokenMetadata!.tokenSymbol as EquityToken,
          etoId: transaction.extraData.tokenMetadata!.tokenCommitmentAddress!,
          icon: transaction.extraData.tokenMetadata!.tokenImage,
          from: transaction.extraData.fromAddress!,
          to: transaction.extraData.toAddress!,
        };
      } else {
        const currency = getCurrencyFromTokenSymbol(transaction.extraData.tokenMetadata);

        const amountEur: string = yield select((state: IAppState) =>
          selectEurEquivalent(state, common.amount, currency),
        );

        tx = {
          ...common,
          currency,
          amountEur,
          type: transaction.type,
          subType: undefined,
          to: transaction.extraData.toAddress!,
          from: transaction.extraData.fromAddress!,
        };
      }
      break;
    }
    case ETransactionType.NEUR_REDEEM:
    case ETransactionType.NEUR_DESTROY:
    case ETransactionType.NEUR_PURCHASE: {
      tx = {
        ...common,
        type: transaction.type,
        currency: ECurrency.EUR_TOKEN,
      };
      break;
    }
    case ETransactionType.ETO_TOKENS_CLAIM:
      {
        if (!transaction.extraData.assetTokenMetadata) {
          throw new Error("Asset token metadata should be provided");
        }

        tx = {
          ...common,
          type: transaction.type,
          amountFormat: getDecimalsFormat(transaction.extraData.assetTokenMetadata),
          currency: getCurrencyFromTokenSymbol(transaction.extraData.assetTokenMetadata),
        };
      }
      break;

    case ETransactionType.PAYOUT:
    case ETransactionType.REDISTRIBUTE_PAYOUT: {
      if (!transaction.extraData.tokenMetadata) {
        throw new Error("Invalid token metadata");
      }

      tx = {
        ...common,
        type: transaction.type,
        currency: getCurrencyFromTokenSymbol(transaction.extraData.tokenMetadata),
      };
      break;
    }
    default:
      logger.warn(new Error(`Transaction with unknown type received ${transaction.type}`));
  }

  return tx;
}

export function* mapAnalyticsApiTransactionsResponse(
  _: TGlobalDependencies,
  transactions: TAnalyticsTransaction[],
): Iterator<any> {
  const txHistoryTransactions: ReadonlyArray<TTxHistory | undefined> = yield all(
    transactions.map(tx => neuCall(mapAnalyticsApiTransactionResponse, tx)),
  );

  return txHistoryTransactions.filter(Boolean);
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
