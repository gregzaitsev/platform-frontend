import { createSelector } from "reselect";

import { IAppState } from "../../store";
import { EModuleStatus } from "./reducer";

export const selectTxHistoryState = (state: IAppState) => state.txHistory;

export const selectLastTransactionId = createSelector(
  selectTxHistoryState,
  state => state.lastTransactionId,
);

export const selectTimestampOfLastChange = createSelector(
  selectTxHistoryState,
  state => state.timestampOfLastChange,
);

export const selectModuleStatus = createSelector(
  selectTxHistoryState,
  state => state.status,
);

// TODO: make it better
export const selectTXById = (id: string, state: IAppState) => {
  const txHistoryRoot = selectTxHistoryRoot(state);

  if (txHistoryRoot.transactionsByHash) {
    return txHistoryRoot.transactionsByHash[id];
  }

  return undefined;
};

export const selectTxByOrder = createSelector(
  selectTxHistoryState,
  ({ transactionsOrder, transactionsByHash }) => {
    if (transactionsOrder && transactionsByHash) {
      return transactionsOrder.map(txHash => {
        const tx = transactionsByHash[txHash];

        if (tx === undefined) {
          throw new Error("Invalid tx history state.");
        }

        return tx;
      });
    }

    return undefined;
  },
);

export const selectTxHistoryPaginated = createSelector(
  selectTxByOrder,
  selectLastTransactionId,
  selectModuleStatus,
  (transactions, nextTransactionToLoad, status) => ({
    transactions,
    canLoadMore: !!nextTransactionToLoad,
    isLoading: status === EModuleStatus.LOADING,
  }),
);
