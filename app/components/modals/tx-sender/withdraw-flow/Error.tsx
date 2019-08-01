import * as React from "react";
import { FormattedMessage } from "react-intl-phraseapp";
import { branch, compose, withProps } from "recompose";

import { ETransactionErrorType } from "../../../../modules/tx/sender/reducer";
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
  txTimestamp?: number;
  error?: ETransactionErrorType;
}

interface IStateProps {
  additionalData?: TWithdrawAdditionalData;
}

interface IComputedProps {
  isMined: boolean;
}

type TComponentProps = RequiredByKeys<IStateProps, "additionalData"> &
  IExternalProps &
  IComputedProps;

export const WithdrawErrorLayout: React.FunctionComponent<TComponentProps> = ({
  additionalData,
  txHash,
  txTimestamp,
  error,
  isMined,
}) => (
  <section className={styles.contentWrapper} data-test-id="modals.tx-sender.withdraw-flow.error">
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
      status={ETxStatus.ERROR}
      txHash={txHash}
      txTimestamp={txTimestamp}
      error={error}
      isMined={isMined}
    />
  </section>
);

export const WithdrawError = compose<TComponentProps, IExternalProps>(
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
  withProps<IComputedProps, IExternalProps>(props => ({
    isMined: props.error === ETransactionErrorType.REVERTED_TX,
  })),
)(WithdrawErrorLayout);
