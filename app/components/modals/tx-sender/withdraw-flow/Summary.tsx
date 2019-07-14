import * as React from "react";
import { FormattedMessage } from "react-intl-phraseapp";

import { actions } from "../../../../modules/actions";
import { selectTxAdditionalData } from "../../../../modules/tx/sender/selectors";
import { TWithdrawAdditionalData } from "../../../../modules/tx/transactions/withdraw/types";
import { ETxSenderType } from "../../../../modules/tx/types";
import { appConnect } from "../../../../store";
import { Button } from "../../../shared/buttons";
import { ButtonArrowLeft } from "../../../shared/buttons/Button";
import { EHeadingSize, Heading } from "../../../shared/Heading";
import { WithdrawTransactionDetails } from "./WithdrawTransactionDetails";

import * as styles from "./Withdraw.module.scss";

interface IStateProps {
  additionalData: TWithdrawAdditionalData;
}

interface IDispatchProps {
  onAccept: () => void;
  onChange: () => void;
}

type TComponentProps = IStateProps & IDispatchProps;

export const WithdrawSummaryComponent: React.FunctionComponent<TComponentProps> = ({
  additionalData,
  onAccept,
  onChange,
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

    <ButtonArrowLeft innerClassName="pl-0 mb-4" onClick={onChange}>
      <FormattedMessage id="modal.sent-eth.change" />
    </ButtonArrowLeft>

    <WithdrawTransactionDetails additionalData={additionalData} className="mb-4">
      <FormattedMessage id="withdraw-flow.awaiting-confirmation" />
    </WithdrawTransactionDetails>

    <section className="text-center">
      <Button onClick={onAccept} data-test-id="modals.tx-sender.withdraw-flow.summary.accept">
        <FormattedMessage id="withdraw-flow.confirm" />
      </Button>
    </section>
  </section>
);

export const WithdrawSummary = appConnect<IStateProps, IDispatchProps>({
  stateToProps: state => ({
    additionalData: selectTxAdditionalData<ETxSenderType.WITHDRAW>(state)!,
  }),
  dispatchToProps: d => ({
    onAccept: () => d(actions.txSender.txSenderAccept()),
    onChange: () => d(actions.txSender.txSenderChange(ETxSenderType.WITHDRAW)),
  }),
})(WithdrawSummaryComponent);
