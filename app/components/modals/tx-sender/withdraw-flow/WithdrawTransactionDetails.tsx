import * as cn from "classnames";
import * as React from "react";
import { FormattedMessage } from "react-intl-phraseapp";

import { ETxSenderType, TAdditionalDataByType } from "../../../../modules/tx/types";
import { CommonHtmlProps } from "../../../../types";
import { assertNever } from "../../../../utils/assertNever";
import { ECurrency, ENumberOutputFormat } from "../../../shared/formatters/utils";
import { ESize, ETextPosition, ETheme, MoneySuiteWidget } from "../../../shared/MoneySuiteWidget";
import { DataRow } from "../shared/DataRow";
import { ETxStatus } from "../types";

import * as styles from "./Withdraw.module.scss";

interface IExternalProps {
  additionalData: TAdditionalDataByType<ETxSenderType.WITHDRAW>;
  status: ETxStatus;
}

type TComponentProps = IExternalProps & CommonHtmlProps;

type TStatusLabel = Pick<IExternalProps, "status">;

const StatusLabel: React.FunctionComponent<TStatusLabel> = ({ status }) => {
  switch (status) {
    case ETxStatus.AWAITING_CONFIRMATION:
      return <FormattedMessage id="withdraw-flow.awaiting-confirmation" />;
    case ETxStatus.PENDING:
      return <FormattedMessage id="withdraw-flow.pending" />;
    case ETxStatus.COMPLETE:
      return <FormattedMessage id="withdraw-flow.success" />;
    case ETxStatus.ERROR:
      return <FormattedMessage id="withdraw-flow.error" />;
    default:
      return assertNever(status);
  }
};

const WithdrawTransactionDetails: React.FunctionComponent<TComponentProps> = ({
  additionalData,
  status,
}) => (
  <>
    <p className="mb-0">
      <FormattedMessage id="modal.sent-eth.to-address" />
    </p>
    <p className={cn(styles.money, styles.withSpacing)}>
      <small data-test-id="modals.tx-sender.withdraw-flow.summary.to">{additionalData.to}</small>
    </p>
    <p className="mb-0">
      <FormattedMessage id="modal.sent-eth.transfer-status" />
    </p>
    <p className={cn(styles.money, styles.moneyBig)}>
      <StatusLabel status={status} />
    </p>

    <hr className={styles.separator} />

    <DataRow
      className={styles.withSpacing}
      caption={<FormattedMessage id="modal.sent-eth.amount" />}
      value={
        <MoneySuiteWidget
          currency={ECurrency.ETH}
          largeNumber={additionalData.value}
          value={additionalData.amountEur}
          currencyTotal={ECurrency.EUR}
          data-test-id="modals.tx-sender.withdraw-flow.summary.value"
          theme={ETheme.BLACK}
          size={ESize.MEDIUM}
          textPosition={ETextPosition.RIGHT}
        />
      }
    />

    <DataRow
      className={styles.withSpacing}
      caption={<FormattedMessage id="modal.sent-eth.transaction-fee" />}
      value={
        <MoneySuiteWidget
          currency={ECurrency.ETH}
          largeNumber={additionalData.cost}
          value={additionalData.costEur}
          currencyTotal={ECurrency.EUR}
          data-test-id="modals.tx-sender.withdraw-flow.summary.cost"
          theme={ETheme.BLACK}
          size={ESize.MEDIUM}
          textPosition={ETextPosition.RIGHT}
          outputFormat={ENumberOutputFormat.ONLY_NONZERO_DECIMALS_ROUND_UP}
        />
      }
    />

    <hr className={styles.separator} />

    <DataRow
      className={cn(styles.sectionBig, styles.withSpacing)}
      caption={<FormattedMessage id="modal.sent-eth.total" />}
      value={
        <MoneySuiteWidget
          currency={ECurrency.ETH}
          largeNumber={additionalData.total}
          value={additionalData.totalEur}
          currencyTotal={ECurrency.EUR}
          data-test-id="modals.tx-sender.withdraw-flow.summary.cost"
          theme={ETheme.BLACK}
          size={ESize.HUGE}
          textPosition={ETextPosition.RIGHT}
          outputFormat={ENumberOutputFormat.ONLY_NONZERO_DECIMALS_ROUND_UP}
        />
      }
    />
  </>
);

export { WithdrawTransactionDetails };
