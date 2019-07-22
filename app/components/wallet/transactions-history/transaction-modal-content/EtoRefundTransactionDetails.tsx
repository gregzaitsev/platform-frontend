import * as React from "react";

import { ETransactionType } from "../../../../lib/api/analytics-api/interfaces";
import { TTxHistory } from "../../../../modules/tx-history/types";
import { etoPublicViewByIdLinkLegacy } from "../../../appRouteUtils";
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
  transaction: TTxHistory;
}

const EtoRefundTransactionsDetails: React.FunctionComponent<IExternalProps> = ({ transaction }) => {
  if (transaction.type !== ETransactionType.ETO_REFUND) {
    throw new Error("Only eto refund transaction type is allowed");
  }

  return (
    <>
      <p>
        <ExternalLink href={etoPublicViewByIdLinkLegacy(transaction.etoId)}>
          View Company Profile
        </ExternalLink>
      </p>

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
        caption={"Investment Refunded"}
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

export { EtoRefundTransactionsDetails };
