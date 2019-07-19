import * as cn from "classnames";
import * as React from "react";
import { FormattedDate, FormattedRelative } from "react-intl";
import { FormattedMessage } from "react-intl-phraseapp";

import { ETransactionType } from "../../../lib/api/analytics-api/interfaces";
import { ETransactionSubType, TTxHistory } from "../../../modules/tx-history/types";
import { CommonHtmlProps, TTranslatedString } from "../../../types";
import { assertNever } from "../../../utils/assertNever";
import { etoPublicViewByIdLinkLegacy } from "../../appRouteUtils";
import { DataRow } from "../../modals/tx-sender/shared/DataRow";
import { ECurrency, ENumberOutputFormat, selectUnits } from "../../shared/formatters/utils";
import { EHeadingSize, Heading } from "../../shared/Heading";
import { getIconForCurrency } from "../../shared/icons/CurrencyIcon";
import { EtherscanAddressLink, EtherscanTxLink } from "../../shared/links/EtherscanLink";
import { ExternalLink } from "../../shared/links/ExternalLink";
import { ETextPosition, ETheme, MoneySuiteWidget } from "../../shared/MoneySuiteWidget";
import { ESize, TransactionData } from "../../shared/TransactionData";

import * as styles from "../../modals/tx-sender/withdraw-flow/Withdraw.module.scss";

interface IExternalProps {
  closeModal: () => void;
  transaction: TTxHistory;
}

const ModalHeading: React.FunctionComponent<{ children: TTranslatedString } & CommonHtmlProps> = ({
  children,
  className,
}) => (
  <Heading
    size={EHeadingSize.HUGE}
    level={4}
    decorator={false}
    disableTransform={true}
    className={className}
  >
    {children}
  </Heading>
);

const TransferTransactionDetails: React.FunctionComponent<IExternalProps> = ({ transaction }) => {
  if (transaction.type !== ETransactionType.TRANSFER) {
    throw new Error("Only transfer transaction types are allowed");
  }

  return (
    <>
      <ModalHeading className={cn({ "mb-4": transaction.subType === undefined })}>
        <FormattedMessage
          id="wallet.tx-list.name.transfer.transferred"
          values={{ currency: selectUnits(transaction.currency) }}
        />
      </ModalHeading>
      {transaction.subType === ETransactionSubType.TRANSFER_EQUITY_TOKEN && (
        <p className="mb-4">
          <ExternalLink href={etoPublicViewByIdLinkLegacy(transaction.etoId)}>
            View Company Profile
          </ExternalLink>
        </p>
      )}

      <DataRow className={styles.withSpacing} caption={"Status"} value={"Complete"} />

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

      <EtherscanTxLink txHash={transaction.txHash}>Etherscan</EtherscanTxLink>
    </>
  );
};

const TransactionTypeToComponentMap: React.FunctionComponent<IExternalProps> = props => {
  switch (props.transaction.type) {
    case ETransactionType.TRANSFER:
      return <TransferTransactionDetails {...props} />;
    case ETransactionType.NEUR_PURCHASE:
    case ETransactionType.ETO_INVESTMENT:
    case ETransactionType.ETO_REFUND:
    case ETransactionType.NEUR_REDEEM:
    case ETransactionType.ETO_TOKENS_CLAIM:
    case ETransactionType.REDISTRIBUTE_PAYOUT:
    case ETransactionType.PAYOUT:
    case ETransactionType.NEUR_DESTROY:
      return null;
    default:
      return assertNever(props.transaction, "Can't find component related to transaction");
  }
};

export const TransactionDetailsModal: React.FunctionComponent<IExternalProps> = props => (
  <section className={styles.contentWrapper} data-test-id="modals.tx-sender.withdraw-flow.success">
    <TransactionTypeToComponentMap {...props} />
  </section>
);
