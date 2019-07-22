import * as React from "react";

import { ETransactionType } from "../../../../lib/api/analytics-api/interfaces";
import { TTxHistory } from "../../../../modules/tx-history/types";
import { DataRow } from "../../../modals/tx-sender/shared/DataRow";
import { ECurrency, ENumberOutputFormat } from "../../../shared/formatters/utils";
import { getIconForCurrency } from "../../../shared/icons/CurrencyIcon";
import { EtherscanAddressLink } from "../../../shared/links/EtherscanLink";
import { ETextPosition, ETheme, MoneySuiteWidget } from "../../../shared/MoneySuiteWidget";
import { ESize } from "../../../shared/TransactionData";
import { BasicTransactionDetails } from "./BasicTransactionDetails";

import * as styles from "../../../modals/tx-sender/withdraw-flow/Withdraw.module.scss";

interface IExternalProps {
  transaction: TTxHistory;
}

const PayoutTransactionsDetails: React.FunctionComponent<IExternalProps> = ({ transaction }) => {
  if (
    transaction.type !== ETransactionType.PAYOUT &&
    transaction.type !== ETransactionType.REDISTRIBUTE_PAYOUT
  ) {
    throw new Error("Only payout transactions types are allowed");
  }

  return (
    <>
      <BasicTransactionDetails transaction={transaction} />

      <hr className={styles.separator} />

      <DataRow
        className={styles.withSpacing}
        caption={"Paid Out To"}
        value={<EtherscanAddressLink address={transaction.toAddress} />}
        clipboardCopyValue={transaction.toAddress}
      />

      <hr className={styles.separator} />

      <DataRow
        className={styles.withSpacing}
        caption={"Amount received"}
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
    </>
  );
};

export { PayoutTransactionsDetails };
