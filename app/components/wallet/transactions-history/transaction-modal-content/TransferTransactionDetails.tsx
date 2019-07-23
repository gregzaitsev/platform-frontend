import * as React from "react";

import { ETransactionType } from "../../../../lib/api/analytics-api/interfaces";
import {
  ETransactionSubType,
  TExtractTxHistoryFromType,
} from "../../../../modules/tx-history/types";
import { etoPublicViewByIdLinkLegacy } from "../../../appRouteUtils";
import { DataRow, DataRowSeparator } from "../../../modals/tx-sender/shared/DataRow";
import { ECurrency, ENumberOutputFormat } from "../../../shared/formatters/utils";
import { getIconForCurrency } from "../../../shared/icons/CurrencyIcon";
import { EtherscanAddressLink } from "../../../shared/links/EtherscanLink";
import { ExternalLink } from "../../../shared/links/ExternalLink";
import { ETextPosition, ETheme, MoneySuiteWidget } from "../../../shared/MoneySuiteWidget";
import { ESize } from "../../../shared/TransactionData";
import { BasicTransactionDetails } from "./BasicTransactionDetails";

interface IExternalProps {
  transaction: TExtractTxHistoryFromType<ETransactionType.TRANSFER>;
}

const TransferTransactionDetails: React.FunctionComponent<IExternalProps> = ({ transaction }) => (
  <>
    {transaction.subType === ETransactionSubType.TRANSFER_EQUITY_TOKEN && (
      <p>
        <ExternalLink href={etoPublicViewByIdLinkLegacy(transaction.etoId)}>
          View Company Profile
        </ExternalLink>
      </p>
    )}

    <BasicTransactionDetails transaction={transaction} />

    <DataRowSeparator />

    <DataRow
      caption={"From address"}
      value={<EtherscanAddressLink address={transaction.fromAddress} />}
      clipboardCopyValue={transaction.fromAddress}
    />

    <DataRow
      caption={"To address"}
      clipboardCopyValue={transaction.toAddress}
      value={<EtherscanAddressLink address={transaction.toAddress} />}
    />

    <DataRowSeparator />

    {transaction.subType === ETransactionSubType.TRANSFER_EQUITY_TOKEN && (
      <DataRow
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

export { TransferTransactionDetails };
