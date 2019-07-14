import * as cn from "classnames";
import * as React from "react";
import { FormattedMessage } from "react-intl-phraseapp";

import { ETxSenderType } from "../../../../modules/tx/types";
import { MoneyNew } from "../../../shared/formatters/Money";
import {
  ECurrency,
  ENumberInputFormat,
  ENumberOutputFormat,
} from "../../../shared/formatters/utils";
import { TimestampRow } from "../shared/TimestampRow";
import { TransactionDetailsComponent } from "../types";

import * as styles from "./Withdraw.module.scss";

const WithdrawTransactionDetails: TransactionDetailsComponent<ETxSenderType.WITHDRAW> = ({
  additionalData,
  txTimestamp,
  children,
}) => (
  <>
    <p className="mb-0">
      <FormattedMessage id="modal.sent-eth.to-address" />
    </p>
    <p className={cn(styles.money, "mb-4")}>
      <small data-test-id="modals.tx-sender.withdraw-flow.summary.to">{additionalData.to}</small>
    </p>
    <p className="mb-0">
      <FormattedMessage id="modal.sent-eth.transfer-status" />
    </p>
    <p className={styles.moneyBig}>{children}</p>

    <hr className={styles.separator} />

    <section className={cn(styles.section, "mb-4")}>
      <FormattedMessage id="modal.sent-eth.amount" />
      <div className="text-right">
        <MoneyNew
          className={cn(styles.money, "d-block")}
          value={additionalData.amount}
          inputFormat={ENumberInputFormat.ULPS}
          valueType={ECurrency.ETH}
          outputFormat={ENumberOutputFormat.ONLY_NONZERO_DECIMALS_ROUND_UP}
          data-test-id="modals.tx-sender.withdraw-flow.summary.value"
        />
        <small>
          {"= "}
          <MoneyNew
            value={additionalData.amountEur}
            inputFormat={ENumberInputFormat.ULPS}
            valueType={ECurrency.EUR}
            outputFormat={ENumberOutputFormat.ONLY_NONZERO_DECIMALS_ROUND_UP}
          />
        </small>
      </div>
    </section>

    <section className={cn(styles.section, "mb-4")}>
      <FormattedMessage id="modal.sent-eth.transaction-fee" />
      <div className="text-right">
        <MoneyNew
          className={cn(styles.money, "d-block")}
          value={additionalData.cost}
          inputFormat={ENumberInputFormat.ULPS}
          valueType={ECurrency.ETH}
          outputFormat={ENumberOutputFormat.ONLY_NONZERO_DECIMALS_ROUND_UP}
          data-test-id="modals.tx-sender.withdraw-flow.summary.cost"
        />
        <small>
          {"= "}
          <MoneyNew
            value={additionalData.costEur}
            inputFormat={ENumberInputFormat.ULPS}
            valueType={ECurrency.EUR}
            outputFormat={ENumberOutputFormat.ONLY_NONZERO_DECIMALS_ROUND_UP}
          />
        </small>
      </div>
    </section>

    <hr className={styles.separator} />

    <section className={cn(styles.sectionBig, "mb-4")}>
      <FormattedMessage id="modal.sent-eth.total" />
      <div className="text-right">
        <MoneyNew
          className={cn(styles.money, "d-block")}
          value={additionalData.total}
          inputFormat={ENumberInputFormat.ULPS}
          valueType={ECurrency.ETH}
          outputFormat={ENumberOutputFormat.ONLY_NONZERO_DECIMALS_ROUND_UP}
        />
        <small>
          {"= "}
          <MoneyNew
            value={additionalData.totalEur}
            inputFormat={ENumberInputFormat.ULPS}
            valueType={ECurrency.EUR}
            outputFormat={ENumberOutputFormat.ONLY_NONZERO_DECIMALS_ROUND_UP}
          />
        </small>
      </div>
    </section>
    {txTimestamp && <TimestampRow timestamp={txTimestamp} />}
  </>
);

export { WithdrawTransactionDetails };
