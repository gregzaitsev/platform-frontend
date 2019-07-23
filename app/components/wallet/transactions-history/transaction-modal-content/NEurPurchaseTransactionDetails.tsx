import * as React from "react";

import { externalRoutes } from "../../../../config/externalRoutes";
import { ETransactionType } from "../../../../lib/api/analytics-api/interfaces";
import { TExtractTxHistoryFromType } from "../../../../modules/tx-history/types";
import { DataRow } from "../../../modals/tx-sender/shared/DataRow";
import { ECurrency, ENumberOutputFormat } from "../../../shared/formatters/utils";
import { getIconForCurrency } from "../../../shared/icons/CurrencyIcon";
import { EtherscanAddressLink } from "../../../shared/links/EtherscanLink";
import { ExternalLink } from "../../../shared/links/ExternalLink";
import { ETextPosition, ETheme, MoneySuiteWidget } from "../../../shared/MoneySuiteWidget";
import { ESize } from "../../../shared/TransactionData";
import { BasicTransactionDetails } from "./BasicTransactionDetails";

import * as styles from "../../../modals/tx-sender/withdraw-flow/Withdraw.module.scss";

interface IExternalProps {
  transaction: TExtractTxHistoryFromType<ETransactionType.NEUR_PURCHASE>;
}

const NEurPurchaseTransactionDetails: React.FunctionComponent<IExternalProps> = ({
  transaction,
}) => (
  <>
    <BasicTransactionDetails transaction={transaction} />

    <hr className={styles.separator} />

    <DataRow
      className={styles.withSpacing}
      caption={"Handled by"}
      value={<ExternalLink href={externalRoutes.quintessenceLanding}>Quintessence UG</ExternalLink>}
    />

    <DataRow
      className={styles.withSpacing}
      caption={"To address"}
      clipboardCopyValue={transaction.to}
      value={<EtherscanAddressLink address={transaction.to} />}
    />

    <hr className={styles.separator} />

    <DataRow
      className={styles.withSpacing}
      caption={"Purchased"}
      value={
        <MoneySuiteWidget
          icon={getIconForCurrency(transaction.currency)}
          currency={transaction.currency}
          largeNumber={transaction.amount}
          value={transaction.amount}
          currencyTotal={ECurrency.EUR}
          theme={ETheme.BLACK}
          size={ESize.MEDIUM}
          textPosition={ETextPosition.RIGHT}
          outputFormat={ENumberOutputFormat.ONLY_NONZERO_DECIMALS_ROUND_UP}
        />
      }
    />
  </>
);

export { NEurPurchaseTransactionDetails };
