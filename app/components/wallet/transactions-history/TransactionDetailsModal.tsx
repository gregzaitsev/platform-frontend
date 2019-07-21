import * as cn from "classnames";
import * as React from "react";
import { FormattedDate, FormattedRelative } from "react-intl";

import { externalRoutes } from "../../../config/externalRoutes";
import { ETransactionType } from "../../../lib/api/analytics-api/interfaces";
import { ETransactionSubType, TTxHistory } from "../../../modules/tx-history/types";
import { CommonHtmlProps, TTranslatedString } from "../../../types";
import { assertNever } from "../../../utils/assertNever";
import { etoPublicViewByIdLinkLegacy } from "../../appRouteUtils";
import { DataRow } from "../../modals/tx-sender/shared/DataRow";
import { ECurrency, ENumberOutputFormat } from "../../shared/formatters/utils";
import { EHeadingSize, Heading } from "../../shared/Heading";
import { getIconForCurrency } from "../../shared/icons/CurrencyIcon";
import { EtherscanAddressLink, EtherscanTxLink } from "../../shared/links/EtherscanLink";
import { ExternalLink } from "../../shared/links/ExternalLink";
import { ETextPosition, ETheme, MoneySuiteWidget } from "../../shared/MoneySuiteWidget";
import { ESize, TransactionData } from "../../shared/TransactionData";
import { TransactionName } from "./TransactionName";

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

const NEurPurchaseTransactionDetails: React.FunctionComponent<IExternalProps> = ({
  transaction,
}) => {
  if (transaction.type !== ETransactionType.NEUR_PURCHASE) {
    throw new Error("Only neur purchase transaction type is allowed");
  }

  return (
    <>
      <DataRow
        className={cn(styles.withSpacing, { "mt-4": transaction.subType === undefined })}
        caption={"Status"}
        value={"Complete"}
      />

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
        caption={"Handled by"}
        value={
          <ExternalLink href={externalRoutes.quintessenceLanding}>Quintessence UG</ExternalLink>
        }
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
};

const EtoTokensClaimTransactionDetails: React.FunctionComponent<IExternalProps> = ({
  transaction,
}) => {
  if (transaction.type !== ETransactionType.ETO_TOKENS_CLAIM) {
    throw new Error("Only token claim transaction type is allowed");
  }

  return (
    <>
      <p>
        <ExternalLink href={etoPublicViewByIdLinkLegacy(transaction.etoId)}>
          View Company Profile
        </ExternalLink>
      </p>

      <DataRow
        className={cn(styles.withSpacing, { "mt-4": transaction.subType === undefined })}
        caption={"Status"}
        value={"Complete"}
      />

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
        caption={"Neu Reward"}
        value={
          <MoneySuiteWidget
            icon={getIconForCurrency(ECurrency.NEU)}
            currency={ECurrency.NEU}
            largeNumber={transaction.neuReward}
            value={transaction.neuRewardEur}
            currencyTotal={ECurrency.EUR}
            theme={ETheme.BLACK}
            size={ESize.MEDIUM}
            textPosition={ETextPosition.RIGHT}
            outputFormat={ENumberOutputFormat.ONLY_NONZERO_DECIMALS_ROUND_UP}
          />
        }
      />

      <hr className={styles.separator} />

      <DataRow
        className={styles.withSpacing}
        caption={"Claimed"}
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
    </>
  );
};

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

const TransactionTypeToComponentMap: React.FunctionComponent<IExternalProps> = props => {
  switch (props.transaction.type) {
    case ETransactionType.TRANSFER:
      return <TransferTransactionDetails {...props} />;
    case ETransactionType.NEUR_PURCHASE:
      return <NEurPurchaseTransactionDetails {...props} />;
    case ETransactionType.ETO_INVESTMENT:
    case ETransactionType.ETO_REFUND:
    case ETransactionType.NEUR_REDEEM:
    case ETransactionType.ETO_TOKENS_CLAIM:
      return <EtoTokensClaimTransactionDetails {...props} />;
    case ETransactionType.REDISTRIBUTE_PAYOUT:
    case ETransactionType.PAYOUT:
    case ETransactionType.NEUR_DESTROY:
      return null;
    default:
      return assertNever(props.transaction, "Can't find component related to transaction");
  }
};

export const TransactionDetailsModal: React.FunctionComponent<IExternalProps> = props => (
  <section className={styles.contentWrapper}>
    <ModalHeading>
      <TransactionName transaction={props.transaction} />
    </ModalHeading>

    <TransactionTypeToComponentMap {...props} />

    <EtherscanTxLink txHash={props.transaction.txHash}>Etherscan</EtherscanTxLink>
  </section>
);
