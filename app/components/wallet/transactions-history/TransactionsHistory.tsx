import * as cn from "classnames";
import * as React from "react";
import { FormattedDate } from "react-intl";
import { FormattedMessage } from "react-intl-phraseapp";
import { branch, compose, renderComponent } from "recompose";

import { ETransactionDirection } from "../../../lib/api/analytics-api/interfaces";
import { actions } from "../../../modules/actions";
import { selectTxHistoryPaginated } from "../../../modules/tx-history/selectors";
import { appConnect } from "../../../store";
import { onEnterAction } from "../../../utils/OnEnterAction";
import { onLeaveAction } from "../../../utils/OnLeaveAction";
import { Button, EButtonLayout } from "../../shared/buttons/Button";
import { EThemeNew, MoneyNew } from "../../shared/formatters/Money";
import { ENumberOutputFormat } from "../../shared/formatters/utils";
import { Heading } from "../../shared/Heading";
import { LoadingIndicator } from "../../shared/loading-indicator/LoadingIndicator";
import { Panel } from "../../shared/Panel";
import { NewTableRow, Table } from "../../shared/table";
import { ESize, TransactionData } from "../../shared/TransactionData";
import { TransactionName } from "./TransactionName";

import * as styles from "./TransactionsHistory.module.scss";

type TStateProps = {
  transactionsHistoryPaginated: ReturnType<typeof selectTxHistoryPaginated>;
};

type TDispatchProps = {
  loadTxHistoryNext: () => void;
  showTransactionDetails: (id: string) => void;
};

const TransactionListLayout: React.FunctionComponent<TStateProps & TDispatchProps> = ({
  transactionsHistoryPaginated,
  loadTxHistoryNext,
  showTransactionDetails,
}) => (
  <Panel>
    {transactionsHistoryPaginated.transactions && (
      <div className={styles.table}>
        <Table
          aria-describedby="transactions-history-heading"
          titles={[
            <FormattedMessage id="wallet.tx-list.transaction" />,
            <FormattedMessage id="wallet.tx-list.amount" />,
          ]}
          titlesVisuallyHidden={true}
          placeholder={<FormattedMessage id="wallet.tx-list.placeholder" />}
        >
          {transactionsHistoryPaginated.transactions.map(transaction => {
            const isIncomeTransaction =
              transaction.transactionDirection === ETransactionDirection.IN;

            return (
              <NewTableRow
                key={transaction.id}
                onClick={() => showTransactionDetails(transaction.id)}
              >
                <TransactionData
                  top={<TransactionName transaction={transaction} />}
                  bottom={
                    <FormattedDate
                      value={transaction.date}
                      year="numeric"
                      month="long"
                      day="2-digit"
                    />
                  }
                  size={ESize.LARGE}
                />
                <MoneyNew
                  className={cn(styles.amount, { [styles.amountIn]: isIncomeTransaction })}
                  inputFormat={transaction.amountFormat}
                  outputFormat={ENumberOutputFormat.ONLY_NONZERO_DECIMALS}
                  theme={isIncomeTransaction ? EThemeNew.GREEN : undefined}
                  value={transaction.amount}
                  valueType={transaction.currency}
                />
              </NewTableRow>
            );
          })}
        </Table>
      </div>
    )}
    {transactionsHistoryPaginated.canLoadMore && (
      <Button
        layout={EButtonLayout.SECONDARY}
        isLoading={transactionsHistoryPaginated.isLoading}
        onClick={loadTxHistoryNext}
      >
        Load more
      </Button>
    )}
  </Panel>
);

const TransactionsList = compose<TStateProps & TDispatchProps, {}>(
  onEnterAction({
    actionCreator: dispatch => {
      dispatch(actions.txHistory.loadTransactions());
    },
  }),
  onLeaveAction({
    actionCreator: dispatch => {
      dispatch(actions.txHistory.stopWatchingForNewTransactions());
    },
  }),
  appConnect<TStateProps, TDispatchProps>({
    stateToProps: state => ({
      transactionsHistoryPaginated: selectTxHistoryPaginated(state),
    }),
    dispatchToProps: dispatch => ({
      loadTxHistoryNext: () => dispatch(actions.txHistory.loadNextTransactions()),
      showTransactionDetails: (id: string) =>
        dispatch(actions.txHistory.showTransactionDetails(id)),
    }),
  }),
  branch<TStateProps>(
    props =>
      props.transactionsHistoryPaginated.transactions === undefined &&
      props.transactionsHistoryPaginated.isLoading,
    renderComponent(LoadingIndicator),
  ),
)(TransactionListLayout);

const TransactionsHistory: React.FunctionComponent = () => (
  <>
    <Heading id="transactions-history-heading" level={2} decorator={false}>
      <FormattedMessage id="wallet.tx-list.heading" />
    </Heading>

    <TransactionsList />
  </>
);

export { TransactionsHistory };
