import * as cn from "classnames";
import * as React from "react";
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
}

interface IStateProps {
  additionalData: TWithdrawAdditionalData;
}

type TComponentProps = IStateProps & IExternalProps;

export const WithdrawPendingComponent: React.FunctionComponent<TComponentProps> = ({
  additionalData,
  txHash,
}) => (
  <section className={styles.contentWrapper}>
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
      <FormattedMessage id="withdraw-flow.pending" />
    </WithdrawTransactionDetails>

    <section className={cn(styles.section, "mb-4")}>
      <FormattedMessage id="tx-monitor.details.hash-label" />
      <EtherscanTxLink txHash={txHash} className={styles.txHash}>
        <small>{txHash}</small>
      </EtherscanTxLink>
    </section>
  </section>
);

export const WithdrawPending = appConnect<IStateProps, {}>({
  stateToProps: state => ({
    additionalData: selectTxAdditionalData<ETxSenderType.WITHDRAW>(state)!,
  }),
})(WithdrawPendingComponent);
