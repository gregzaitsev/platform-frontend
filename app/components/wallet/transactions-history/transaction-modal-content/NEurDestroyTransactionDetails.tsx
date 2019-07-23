import * as React from "react";

import { ETransactionType } from "../../../../lib/api/analytics-api/interfaces";
import { TExtractTxHistoryFromType } from "../../../../modules/tx-history/types";
import { DataRow } from "../../../modals/tx-sender/shared/DataRow";
import { ECurrency, ENumberOutputFormat } from "../../../shared/formatters/utils";
import { getIconForCurrency } from "../../../shared/icons/CurrencyIcon";
import { EtherscanAddressLink } from "../../../shared/links/EtherscanLink";
import { ETextPosition, ETheme, MoneySuiteWidget } from "../../../shared/MoneySuiteWidget";
import { ESize } from "../../../shared/TransactionData";
import { BasicTransactionDetails } from "./BasicTransactionDetails";

import * as styles from "../../../modals/tx-sender/withdraw-flow/Withdraw.module.scss";

interface IExternalProps {
  transaction: TExtractTxHistoryFromType<ETransactionType.NEUR_DESTROY>;
}

const NEurDestroyTransactionDetails: React.FunctionComponent<IExternalProps> = ({
  transaction,
}) => (
  <>
    <BasicTransactionDetails transaction={transaction} />

    <hr className={styles.separator} />

    <DataRow
      className={styles.withSpacing}
      caption={"Liquidated By"}
      value={
        <EtherscanAddressLink address={transaction.liquidatedByAddress}>
          Fifth Force Lichtenstein
        </EtherscanAddressLink>
      }
    />

    <hr className={styles.separator} />

    <DataRow
      className={styles.withSpacing}
      caption={"Liquidated"}
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

export { NEurDestroyTransactionDetails };
