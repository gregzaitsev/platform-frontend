import * as React from "react";
import { FormattedMessage } from "react-intl-phraseapp";

import { ETransactionType } from "../../../../lib/api/analytics-api/interfaces";
import {
  ETransactionSubType,
  TExtractTxHistoryFromType,
} from "../../../../modules/tx-history/types";
import { etoPublicViewByIdLinkLegacy } from "../../../appRouteUtils";
import { DataRow, DataRowSeparator } from "../../../modals/tx-sender/shared/DataRow";
import { ECurrency } from "../../../shared/formatters/utils";
import { getIconForCurrency } from "../../../shared/icons/CurrencyIcon";
import { EtherscanAddressLink } from "../../../shared/links/EtherscanLink";
import { ExternalLink } from "../../../shared/links/ExternalLink";
import {
  ESize,
  ETextPosition,
  ETheme,
  MoneySingleSuiteWidget,
  MoneySuiteWidget,
} from "../../../shared/MoneySuiteWidget";
import { BasicTransactionDetails } from "./BasicTransactionDetails";

interface IExternalProps {
  transaction: TExtractTxHistoryFromType<ETransactionType.TRANSFER>;
}

const TransferTransactionDetails: React.FunctionComponent<IExternalProps> = ({ transaction }) => (
  <>
    {transaction.subType === ETransactionSubType.TRANSFER_EQUITY_TOKEN && (
      <p>
        <ExternalLink href={etoPublicViewByIdLinkLegacy(transaction.etoId)}>
          <FormattedMessage id="wallet.tx-list.modal.common.view-company-profile" />
        </ExternalLink>
      </p>
    )}

    <BasicTransactionDetails transaction={transaction} />

    <DataRow
      caption={<FormattedMessage id="wallet.tx-list.modal.transfer.from-address.caption" />}
      value={<EtherscanAddressLink address={transaction.fromAddress} />}
      clipboardCopyValue={transaction.fromAddress}
    />

    <DataRow
      caption={<FormattedMessage id="wallet.tx-list.modal.transfer.to-address.caption" />}
      clipboardCopyValue={transaction.toAddress}
      value={<EtherscanAddressLink address={transaction.toAddress} />}
    />

    <DataRowSeparator />

    {transaction.subType === ETransactionSubType.TRANSFER_EQUITY_TOKEN && (
      <DataRow
        caption={<FormattedMessage id="wallet.tx-list.modal.transfer.transferred-amount.caption" />}
        value={
          <MoneySingleSuiteWidget
            icon={transaction.icon}
            currency={transaction.currency}
            value={transaction.amount}
            theme={ETheme.BLACK}
            size={ESize.MEDIUM}
            textPosition={ETextPosition.RIGHT}
            inputFormat={transaction.amountFormat}
          />
        }
      />
    )}

    {transaction.subType === undefined && (
      <DataRow
        caption={<FormattedMessage id="wallet.tx-list.modal.transfer.transferred-amount.caption" />}
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
            inputFormat={transaction.amountFormat}
          />
        }
      />
    )}
  </>
);

export { TransferTransactionDetails };
