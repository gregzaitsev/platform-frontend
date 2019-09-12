import * as React from "react";
import { FormattedMessage } from "react-intl-phraseapp";
import { compose, withProps } from "recompose";

import { actions } from "../../modules/actions";
import { EEtoAgreementStatus } from "../../modules/eto/types";
import {
  selectNomineeRAAAState,
  selectNomineeTHAState,
} from "../../modules/nominee-flow/selectors";
import { ENomineeTask } from "../../modules/nominee-flow/types";
import { appConnect } from "../../store";
import { onEnterAction } from "../../utils/OnEnterAction";
import { Button, EButtonLayout, EButtonTheme } from "../shared/buttons/Button";

interface IStateProps {
  nomineeTHAStatus: EEtoAgreementStatus;
  nomineeRAAAStatus: EEtoAgreementStatus;
}

interface IExternalProps {
  task: ENomineeTask;
}

interface IDispatchProps {
  sign: () => void;
}

type IComponentProps = IDispatchProps & IExternalProps;

const isRAAA = (task: ENomineeTask): boolean => task === ENomineeTask.ACCEPT_RAAA;

export const AcceptAgreementLayout: React.FunctionComponent<IComponentProps> = ({ sign, task }) => (
  <section data-test-id={isRAAA(task) ? "nominee-flow-sign-raaa" : "nominee-flow-sign-tha"}>
    <h4>
      {isRAAA(task) ? (
        <FormattedMessage id="nominee-flow.sign-raaa.title" />
      ) : (
        <FormattedMessage id="nominee-flow.sign-tha.title" />
      )}
    </h4>
    <p>
      {isRAAA(task) ? (
        <FormattedMessage id="nominee-flow.sign-raaa.text" />
      ) : (
        <FormattedMessage id="nominee-flow.sign-tha.text" />
      )}
    </p>
    <Button
      layout={EButtonLayout.PRIMARY}
      theme={EButtonTheme.BRAND}
      data-test-id="eto-nominee-sign-agreement-action"
      onClick={sign}
    >
      <FormattedMessage id="nominee-flow.sign-agreement.sign-button" />
    </Button>
  </section>
);

const acceptAgreement = compose<IComponentProps, {}>(
  appConnect<IStateProps, IDispatchProps, IExternalProps>({
    stateToProps: state => ({
      nomineeTHAStatus: selectNomineeTHAState(state),
      nomineeRAAAStatus: selectNomineeRAAAState(state),
    }),
    dispatchToProps: (dispatch, ownProps: IExternalProps) => {
      const signAction = isRAAA(ownProps.task)
        ? actions.txTransactions.startNomineeRAAASign()
        : actions.txTransactions.startNomineeTHASign();

      return {
        sign: () => dispatch(signAction),
      };
    },
  }),
  onEnterAction<IStateProps>({
    actionCreator: (dispatch, props) => {
      if (
        props.nomineeTHAStatus === EEtoAgreementStatus.ERROR ||
        props.nomineeRAAAStatus === EEtoAgreementStatus.ERROR
      )
        dispatch(actions.nomineeFlow.loadNomineeTaskData());
    },
  }),
);

const AcceptTHA = compose<IComponentProps, {}>(
  withProps(() => ({ task: ENomineeTask.ACCEPT_THA })),
  acceptAgreement,
)(AcceptAgreementLayout);

const AcceptRAAA = compose<IComponentProps, {}>(
  withProps(() => ({ task: ENomineeTask.ACCEPT_RAAA })),
  acceptAgreement,
)(AcceptAgreementLayout);

export { AcceptRAAA, AcceptTHA };
