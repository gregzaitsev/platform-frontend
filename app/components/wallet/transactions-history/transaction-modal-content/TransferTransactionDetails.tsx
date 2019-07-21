import * as cn from "classnames";
import * as React from "react";
import { FormattedDate, FormattedRelative } from "react-intl";

import { ETransactionType } from "../../../../lib/api/analytics-api/interfaces";
import { ETransactionSubType, TTxHistory } from "../../../../modules/tx-history/types";
import { etoPublicViewByIdLinkLegacy } from "../../../appRouteUtils";
import { DataRow } from "../../../modals/tx-sender/shared/DataRow";
import { ECurrency, ENumberOutputFormat } from "../../../shared/formatters/utils";
import { getIconForCurrency } from "../../../shared/icons/CurrencyIcon";
import { EtherscanAddressLink } from "../../../shared/links/EtherscanLink";
import { ExternalLink } from "../../../shared/links/ExternalLink";
import { ETextPosition, ETheme, MoneySuiteWidget } from "../../../shared/MoneySuiteWidget";
import { ESize, TransactionData } from "../../../shared/TransactionData";

import * as styles from "../../../modals/tx-sender/withdraw-flow/Withdraw.module.scss";

interface IExternalProps {
  transaction: TTxHistory;
}

const TransferTransactionDetails: React.FunctionComponent<IExternalProps> = ({ transaction }) => {
  if (transaction.type !== ETransactionType.TRANSFER) {
    throw new Error("Only transfer transaction types are allowed");
  }

  return (
    <>
      {transaction.subType === ETransactionSubType.TRANSFER_EQUITY_TOKEN && (
        <p>
          <ExternalLink href={etoPublicViewByIdLinkLegacy(transaction.etoId)}>
            View Company Profile
          </ExternalLink>
        </p>
      )}

      <DataRow className={cn(styles.withSpacing, "mt-4")} caption={"Status"} value={"Complete"} />

      <DataRow
        className={styles.withSpacing}
        caption={"Time"}
        value={
          <TransactionData
            top={<FormattedRelative value={transaction.date} />}
            bottom={
              <FormattedDate
                value={transaction.date}
                timeZone="UTC"
                timeZoneName="short"
                year="numeric"
                month="short"
                day="numeric"
                hour="numeric"
                minute="numeric"
              />
            }
            size={ESize.MEDIUM}
          />
        }
      />

      <hr className={styles.separator} />

      <DataRow
        className={styles.withSpacing}
        caption={"From address"}
        value={<EtherscanAddressLink address={transaction.from} />}
        clipboardCopyValue={transaction.from}
      />

      <DataRow
        className={styles.withSpacing}
        caption={"To address"}
        clipboardCopyValue={transaction.to}
        value={<EtherscanAddressLink address={transaction.to} />}
      />

      <hr className={styles.separator} />

      {transaction.subType === ETransactionSubType.TRANSFER_EQUITY_TOKEN && (
        <DataRow
          className={styles.withSpacing}
          caption={"Transferred"}
          value={
            <MoneySuiteWidget
              icon={transaction.icon}
              currency={transaction.currency}
              largeNumber={transaction.amount}
              theme={ETheme.BLACK}
              size={ESize.MEDIUM}
              textPosition={ETextPosition.RIGHT}
              outputFormat={ENumberOutputFormat.ONLY_NONZERO_DECIMALS_ROUND_UP}
            />
          }
        />
      )}

      {transaction.subType === undefined && (
        <DataRow
          className={styles.withSpacing}
          caption={"Transferred"}
          value={
            <MoneySuiteWidget
              icon={getIconForCurrency(transaction.currency)}
              currency={transaction.currency}
              largeNumber={transaction.amount}
              value={transaction.amountEur}
              currencyTotal={ECurrency.EUR}
              theme={ETheme.BLACK}
              size={ESize.MEDIUM}
              textPosition={ETextPosition.RIGHT}
              outputFormat={ENumberOutputFormat.ONLY_NONZERO_DECIMALS_ROUND_UP}
            />
          }
        />
      )}
    </>
  );
};

export { TransferTransactionDetails };
