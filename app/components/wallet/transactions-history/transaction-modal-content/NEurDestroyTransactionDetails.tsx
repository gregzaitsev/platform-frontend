import * as React from "react";

import { ETransactionType } from "../../../../lib/api/analytics-api/interfaces";
import { TExtractTxHistoryFromType } from "../../../../modules/tx-history/types";
import { DataRow, DataRowSeparator } from "../../../modals/tx-sender/shared/DataRow";
import { ECurrency, ENumberOutputFormat } from "../../../shared/formatters/utils";
import { getIconForCurrency } from "../../../shared/icons/CurrencyIcon";
import { EtherscanAddressLink } from "../../../shared/links/EtherscanLink";
import { ETextPosition, ETheme, MoneySuiteWidget } from "../../../shared/MoneySuiteWidget";
import { ESize } from "../../../shared/TransactionData";
import { BasicTransactionDetails } from "./BasicTransactionDetails";

interface IExternalProps {
  transaction: TExtractTxHistoryFromType<ETransactionType.NEUR_DESTROY>;
}

const NEurDestroyTransactionDetails: React.FunctionComponent<IExternalProps> = ({
  transaction,
}) => (
  <>
    <BasicTransactionDetails transaction={transaction} />

    <DataRowSeparator />

    <DataRow
      caption={"Liquidated By"}
      value={
        <EtherscanAddressLink address={transaction.liquidatedByAddress}>
          Fifth Force Lichtenstein
        </EtherscanAddressLink>
      }
    />

    <DataRowSeparator />

    <DataRow
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
