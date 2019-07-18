import * as React from "react";
import { FormattedDate } from "react-intl";
import { FormattedMessage } from "react-intl-phraseapp";
import { branch, compose } from "recompose";

import { selectTxAdditionalData } from "../../../../modules/tx/sender/selectors";
import { TWithdrawAdditionalData } from "../../../../modules/tx/transactions/withdraw/types";
import { ETxSenderType } from "../../../../modules/tx/types";
import { appConnect } from "../../../../store";
import { RequiredByKeys } from "../../../../types";
import { EHeadingSize, Heading } from "../../../shared/Heading";
import { EtherscanTxLink } from "../../../shared/links/EtherscanLink";
import { DataRow } from "../shared/DataRow";
import { ETxStatus } from "../types";
import { WithdrawTransactionDetails } from "./WithdrawTransactionDetails";

import * as styles from "./Withdraw.module.scss";

interface IExternalProps {
  txHash: string;
  txTimestamp: number;
}

interface IStateProps {
  additionalData?: TWithdrawAdditionalData;
}

type TComponentProps = RequiredByKeys<IStateProps, "additionalData"> & IExternalProps;

export const WithdrawSuccessLayout: React.FunctionComponent<TComponentProps> = ({
  additionalData,
  txHash,
  txTimestamp,
}) => (
  <section className={styles.contentWrapper} data-test-id="modals.tx-sender.withdraw-flow.success">
    <Heading
      className="mb-4"
      size={EHeadingSize.HUGE}
      level={4}
      decorator={false}
      disableTransform={true}
    >
      <FormattedMessage id="withdraw-flow.summary" />
    </Heading>

    <WithdrawTransactionDetails additionalData={additionalData} status={ETxStatus.COMPLETE} />

    <DataRow
      className="mb-4"
      caption={<FormattedMessage id="tx-monitor.details.hash-label" />}
      value={
        <EtherscanTxLink
          txHash={txHash}
          className={styles.txHash}
          data-test-id="modals.tx-sender.withdraw-flow.tx-hash"
        >
          {txHash}
        </EtherscanTxLink>
      }
    />

    <DataRow
      data-test-id="timestamp-row.timestamp"
      className="mb-4"
      caption={
        <>
          <FormattedMessage id="tx-monitor.details.timestamp" />
          {": "}
        </>
      }
      value={
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
    />
  </section>
);

export const WithdrawSuccess = compose<TComponentProps, {}>(
  appConnect<IStateProps, {}>({
    stateToProps: state => ({
      additionalData: selectTxAdditionalData<ETxSenderType.WITHDRAW>(state),
    }),
  }),
  branch<IStateProps>(
    props => props.additionalData === undefined,
    () => {
      throw new Error("Additional transaction data is empty");
    },
  ),
)(WithdrawSuccessLayout);
