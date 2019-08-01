import * as cn from "classnames";
import * as React from "react";
import { FormattedDate, FormattedRelative } from "react-intl";
import { FormattedMessage } from "react-intl-phraseapp";

import { externalRoutes } from "../../../../config/externalRoutes";
import { ETransactionErrorType } from "../../../../modules/tx/sender/reducer";
import { ETxSenderType, TAdditionalDataByType } from "../../../../modules/tx/types";
import { CommonHtmlProps } from "../../../../types";
import { ECurrency, ENumberOutputFormat } from "../../../shared/formatters/utils";
import { EtherscanTxLink } from "../../../shared/links/EtherscanLink";
import { ExternalLink } from "../../../shared/links/ExternalLink";
import { ESize, ETextPosition, ETheme, MoneySuiteWidget } from "../../../shared/MoneySuiteWidget";
import {
  ESize as ETransactionDataSize,
  ETheme as ETransactionDataTheme,
  TransactionData,
} from "../../../shared/TransactionData";
import { DataRow, DataRowSeparator } from "../shared/DataRow";
import { TxErrorMessage } from "../shared/TxErrorMessage";
import { TxStatusLabel } from "../shared/TxStatusLabel";
import { ETxStatus } from "../types";

import * as ethIcon from "../../../../assets/img/eth_icon.svg";
import * as styles from "./Withdraw.module.scss";

interface IExternalProps {
  additionalData: TAdditionalDataByType<ETxSenderType.WITHDRAW>;
  status?: ETxStatus;
  txHash?: string;
  txTimestamp?: number;
  blockId?: number;
  error?: ETransactionErrorType;
  isMined?: boolean;
}

type TComponentProps = IExternalProps & CommonHtmlProps;

const WithdrawTransactionDetails: React.FunctionComponent<TComponentProps> = ({
  additionalData,
  status,
  txHash,
  blockId,
  txTimestamp,
  error,
  isMined,
}) => (
  <>
    {status && (
      <>
        <DataRow
          className={cn({ [styles.noSpacing]: !!blockId })}
          caption={<FormattedMessage id="modal.sent-eth.transaction-status" />}
          value={<TxStatusLabel status={status} />}
        />
        {blockId && (
          <DataRow
            className={styles.withSpacing}
            value={
              <span className={styles.block}>
                <FormattedMessage id="modal.sent-eth.block" values={{ blockId }} />
              </span>
            }
          />
        )}

        {error && (
          <TxErrorMessage>
            {isMined ? (
              <FormattedMessage
                id="withdraw-flow.error.mined"
                values={{
                  supportDesk: (
                    <ExternalLink href={externalRoutes.neufundSupportHome}>
                      <FormattedMessage id="withdraw-flow.support-link" />
                    </ExternalLink>
                  ),
                }}
              />
            ) : (
              <FormattedMessage
                id="withdraw-flow.error.not-mined"
                values={{
                  supportDesk: (
                    <ExternalLink href={externalRoutes.neufundSupportHome}>
                      <FormattedMessage id="withdraw-flow.support-link" />
                    </ExternalLink>
                  ),
                }}
              />
            )}
          </TxErrorMessage>
        )}

        {txTimestamp && (
          <DataRow
            data-test-id="timestamp-row.timestamp"
            caption={<FormattedMessage id="modal.sent-eth.timestamp" />}
            value={
              <TransactionData
                top={<FormattedRelative value={txTimestamp} />}
                bottom={
                  <FormattedDate
                    value={txTimestamp}
                    timeZone="UTC"
                    timeZoneName="short"
                    year="numeric"
                    month="short"
                    day="numeric"
                    hour="numeric"
                    minute="numeric"
                  />
                }
                size={ETransactionDataSize.MEDIUM}
                theme={ETransactionDataTheme.BLACK_THIN}
              />
            }
          />
        )}

        {txHash && (
          <DataRow
            className={styles.withSpacing}
            caption={<FormattedMessage id="tx-monitor.details.hash-label" />}
            value={
              <EtherscanTxLink
                data-test-id="modals.tx-sender.withdraw-flow.tx-hash"
                txHash={txHash}
              />
            }
            clipboardCopyValue={txHash}
          />
        )}
        <DataRowSeparator />
      </>
    )}

    {error ? (
      <DataRow
        className={styles.withSpacing}
        caption={<FormattedMessage id="modal.sent-eth.refund-address" />}
        value={<EtherscanTxLink txHash={additionalData.walletAddress} />}
        clipboardCopyValue={additionalData.to}
      />
    ) : (
      <>
        <DataRow
          className={styles.withSpacing}
          caption={<FormattedMessage id="modal.sent-eth.from-address" />}
          value={
            <EtherscanTxLink txHash={additionalData.walletAddress}>
              <FormattedMessage id="modal.sent-eth.my-balance" />
            </EtherscanTxLink>
          }
          clipboardCopyValue={additionalData.to}
        />
        <DataRow
          className={styles.withSpacing}
          caption={<FormattedMessage id="modal.sent-eth.to-address" />}
          value={<EtherscanTxLink txHash={additionalData.to} />}
          clipboardCopyValue={additionalData.to}
        />
      </>
    )}

    <DataRowSeparator />

    <DataRow
      className={styles.withSpacing}
      caption={<FormattedMessage id="modal.sent-eth.amount" />}
      value={
        <MoneySuiteWidget
          currency={ECurrency.ETH}
          largeNumber={error ? "0" : additionalData.value}
          value={error ? "0" : additionalData.amountEur}
          currencyTotal={ECurrency.EUR}
          data-test-id="modals.tx-sender.withdraw-flow.summary.value"
          theme={ETheme.BLACK}
          size={ESize.MEDIUM}
          textPosition={ETextPosition.RIGHT}
          icon={ethIcon}
        />
      }
    />

    {(!error || (error && isMined)) && (
      <DataRow
        className={styles.withSpacing}
        caption={<FormattedMessage id="modal.sent-eth.transaction-fee" />}
        value={
          <MoneySuiteWidget
            currency={ECurrency.ETH}
            largeNumber={additionalData.cost}
            value={additionalData.costEur}
            currencyTotal={ECurrency.EUR}
            data-test-id="modals.tx-sender.withdraw-flow.summary.cost"
            theme={ETheme.BLACK}
            size={ESize.MEDIUM}
            textPosition={ETextPosition.RIGHT}
            outputFormat={ENumberOutputFormat.ONLY_NONZERO_DECIMALS_ROUND_UP}
            icon={ethIcon}
          />
        }
      />
    )}

    {!status && (
      <>
        <DataRowSeparator />

        <DataRow
          className={cn(styles.sectionBig, styles.withSpacing)}
          caption={<FormattedMessage id="modal.sent-eth.total" />}
          value={
            <MoneySuiteWidget
              currency={ECurrency.ETH}
              largeNumber={additionalData.total}
              value={additionalData.totalEur}
              currencyTotal={ECurrency.EUR}
              data-test-id="modals.tx-sender.withdraw-flow.summary.cost"
              theme={ETheme.BLACK}
              size={ESize.HUGE}
              textPosition={ETextPosition.RIGHT}
              outputFormat={ENumberOutputFormat.ONLY_NONZERO_DECIMALS_ROUND_UP}
              icon={ethIcon}
            />
          }
        />
      </>
    )}
  </>
);

export { WithdrawTransactionDetails };
