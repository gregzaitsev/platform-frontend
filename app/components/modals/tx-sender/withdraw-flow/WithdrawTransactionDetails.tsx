import * as cn from "classnames";
import * as React from "react";
import { FormattedMessage } from "react-intl-phraseapp";

import { ETxSenderType } from "../../../../modules/tx/types";
import { ECurrency } from "../../../shared/formatters/utils";
import { ESize, ETextPosition, ETheme, MoneySuiteWidget } from "../../../shared/MoneySuiteWidget";
import { DataRow } from "../shared/DataRow";
import { TransactionDetailsComponent } from "../types";

import * as styles from "./Withdraw.module.scss";

const WithdrawTransactionDetails: TransactionDetailsComponent<ETxSenderType.WITHDRAW> = ({
  additionalData,
  children,
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
    <p className={styles.moneyBig}>{children}</p>

    <hr className={styles.separator} />

    <DataRow
      className={styles.withSpacing}
      caption={<FormattedMessage id="modal.sent-eth.amount" />}
      value={
        <MoneySuiteWidget
          currency={ECurrency.ETH}
          largeNumber={additionalData.amount}
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
        />
      }
    />
  </>
);

export { WithdrawTransactionDetails };
