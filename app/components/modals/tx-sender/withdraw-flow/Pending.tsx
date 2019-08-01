import * as React from "react";
import { FormattedMessage } from "react-intl-phraseapp";
import { branch, compose } from "recompose";

import { selectTxAdditionalData } from "../../../../modules/tx/sender/selectors";
import { TWithdrawAdditionalData } from "../../../../modules/tx/transactions/withdraw/types";
import { ETxSenderType } from "../../../../modules/tx/types";
import { appConnect } from "../../../../store";
import { RequiredByKeys } from "../../../../types";
import { EHeadingSize, Heading } from "../../../shared/Heading";
import { ETxStatus } from "../types";
import { WithdrawTransactionDetails } from "./WithdrawTransactionDetails";

import * as styles from "./Withdraw.module.scss";

interface IExternalProps {
  txHash: string;
  blockId?: number;
  txTimestamp?: number;
}

interface IStateProps {
  additionalData?: TWithdrawAdditionalData;
}

type TComponentProps = RequiredByKeys<IStateProps, "additionalData"> & IExternalProps;

export const WithdrawPendingComponent: React.FunctionComponent<TComponentProps> = ({
  additionalData,
  txHash,
  blockId,
  txTimestamp,
}) => (
  <section className={styles.contentWrapper} data-test-id="modals.shared.tx-pending.modal">
    <Heading
      className="mb-4"
      size={EHeadingSize.HUGE}
      level={4}
      decorator={false}
      disableTransform={true}
    >
      <FormattedMessage id="withdraw-flow.summary" />
    </Heading>

    <WithdrawTransactionDetails
      additionalData={additionalData}
      status={ETxStatus.PENDING}
      txHash={txHash}
      blockId={blockId}
      txTimestamp={txTimestamp}
    />
  </section>
);

export const WithdrawPending = compose<TComponentProps, IExternalProps>(
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
)(WithdrawPendingComponent);
