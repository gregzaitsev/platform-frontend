import * as React from "react";
import { FormattedMessage } from "react-intl-phraseapp";
import { branch, compose } from "recompose";

import { actions } from "../../../../modules/actions";
import { selectTxAdditionalData } from "../../../../modules/tx/sender/selectors";
import { TWithdrawAdditionalData } from "../../../../modules/tx/transactions/withdraw/types";
import { ETxSenderType } from "../../../../modules/tx/types";
import { appConnect } from "../../../../store";
import { RequiredByKeys } from "../../../../types";
import { Button } from "../../../shared/buttons";
import { ButtonArrowLeft, ButtonWidth } from "../../../shared/buttons/Button";
import { EHeadingSize, Heading } from "../../../shared/Heading";
import { ETxStatus } from "../types";
import { WithdrawTransactionDetails } from "./WithdrawTransactionDetails";

import * as styles from "./Withdraw.module.scss";

interface IStateProps {
  additionalData?: TWithdrawAdditionalData;
}

interface IDispatchProps {
  onAccept: () => void;
  onChange: () => void;
}

type TComponentProps = RequiredByKeys<IStateProps, "additionalData"> & IDispatchProps;

export const WithdrawSummaryComponent: React.FunctionComponent<TComponentProps> = ({
  additionalData,
  onAccept,
  onChange,
}) => (
  <section className={styles.contentWrapper}>
    <Heading
      className={styles.withSpacing}
      size={EHeadingSize.HUGE}
      level={4}
      decorator={false}
      disableTransform={true}
    >
      <FormattedMessage id="withdraw-flow.summary" />
    </Heading>

    <ButtonArrowLeft
      className={styles.withSpacing}
      onClick={onChange}
      width={ButtonWidth.NO_PADDING}
    >
      <FormattedMessage id="modal.sent-eth.change" />
    </ButtonArrowLeft>

    <WithdrawTransactionDetails
      additionalData={additionalData}
      className={styles.withSpacing}
      status={ETxStatus.AWAITING_CONFIRMATION}
    />

    <section className="text-center">
      <Button onClick={onAccept} data-test-id="modals.tx-sender.withdraw-flow.summary.accept">
        <FormattedMessage id="withdraw-flow.confirm" />
      </Button>
    </section>
  </section>
);

export const WithdrawSummary = compose<TComponentProps, {}>(
  appConnect<IStateProps, IDispatchProps>({
    stateToProps: state => ({
      additionalData: selectTxAdditionalData<ETxSenderType.WITHDRAW>(state),
    }),
    dispatchToProps: d => ({
      onAccept: () => d(actions.txSender.txSenderAccept()),
      onChange: () => d(actions.txSender.txSenderChange(ETxSenderType.WITHDRAW)),
    }),
  }),
  branch<IStateProps>(
    props => props.additionalData === undefined,
    () => {
      throw new Error("Additional transaction data is empty");
    },
  ),
)(WithdrawSummaryComponent);
