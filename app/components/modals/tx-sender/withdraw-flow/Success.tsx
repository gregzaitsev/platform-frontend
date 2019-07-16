import * as cn from "classnames";
import * as React from "react";
import { FormattedDate } from "react-intl";
import { FormattedMessage } from "react-intl-phraseapp";

import { selectTxAdditionalData } from "../../../../modules/tx/sender/selectors";
import { TWithdrawAdditionalData } from "../../../../modules/tx/transactions/withdraw/types";
import { ETxSenderType } from "../../../../modules/tx/types";
import { appConnect } from "../../../../store";
import { EHeadingSize, Heading } from "../../../shared/Heading";
import { EtherscanTxLink } from "../../../shared/links/EtherscanLink";
import { WithdrawTransactionDetails } from "./WithdrawTransactionDetails";

import * as styles from "./Withdraw.module.scss";

interface IExternalProps {
  txHash: string;
  txTimestamp: number;
}

interface IStateProps {
  additionalData: TWithdrawAdditionalData;
}

type TComponentProps = IStateProps & IExternalProps;

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

    <WithdrawTransactionDetails additionalData={additionalData}>
      <FormattedMessage id="withdraw-flow.success" />
    </WithdrawTransactionDetails>

    <section className={cn(styles.section, "mb-4")}>
      <FormattedMessage id="tx-monitor.details.hash-label" />
      <EtherscanTxLink
        txHash={txHash}
        className={styles.txHash}
        data-test-id="modals.tx-sender.withdraw-flow.tx-hash"
      >
        <small>{txHash}</small>
      </EtherscanTxLink>
    </section>
    <section className={cn(styles.section, "mb-4")} data-test-id="timestamp-row.timestamp">
      <FormattedMessage id="tx-monitor.details.timestamp" />
      {": "}
      <span>
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
      </span>
    </section>
  </section>
);

export const WithdrawSuccess = appConnect<IStateProps, {}>({
  stateToProps: state => ({
    additionalData: selectTxAdditionalData<ETxSenderType.WITHDRAW>(state)!,
  }),
})(WithdrawSuccessLayout);
