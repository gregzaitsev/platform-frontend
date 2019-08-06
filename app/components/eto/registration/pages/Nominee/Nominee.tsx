import * as React from "react";
import { FormattedMessage } from "react-intl-phraseapp";
import { branch, compose, renderComponent } from "recompose";

import { actions } from "../../../../../modules/actions";
import { selectIssuerEtoLoading } from "../../../../../modules/eto-flow/selectors";
import { selectEtoNomineeIsLoading } from "../../../../../modules/eto-nominee/selectors";
import { appConnect } from "../../../../../store";
import { Button, EButtonLayout } from "../../../../shared/buttons/index";
import { LoadingIndicator } from "../../../../shared/loading-indicator/LoadingIndicator";
import { ChooseNominee } from "./ChooseNominee";

import * as styles from "./Nominee.module.scss";

interface IExternalProps {
  readonly: boolean;
  currentNomineeId: string | undefined;
  currentNomineeName: string | undefined;
}

interface IStateProps {
  isLoading: boolean;
}

interface IDispatchProps {
  deleteNomineeRequest: () => void;
}

interface IComponentProps {
  currentNomineeId: string;
  currentNomineeName: string;
  deleteNomineeRequest: () => void;
}

const NomineeChosenComponent: React.FunctionComponent<IExternalProps & IComponentProps> = ({
  readonly,
  currentNomineeName,
  currentNomineeId,
  deleteNomineeRequest,
}) => (
  <div className={styles.nomineeChosenSection}>
    <p className={styles.text}>
      <FormattedMessage id="eto.form.eto-nominee.text" />
    </p>
    <div className={styles.nomineeBlock}>
      <span>{currentNomineeId}</span>
      <span>{currentNomineeName}</span>
    </div>
    {!readonly && (
      <Button
        className={styles.button}
        layout={EButtonLayout.PRIMARY}
        data-test-id="delete-nominee-request"
        onClick={deleteNomineeRequest}
      >
        <FormattedMessage id="eto.form.eto-nominee.cancel-request" />
      </Button>
    )}
  </div>
);

const Nominee = compose<IExternalProps & IComponentProps, IExternalProps>(
  appConnect<IStateProps, IDispatchProps>({
    stateToProps: s => ({
      isLoading: selectEtoNomineeIsLoading(s) || selectIssuerEtoLoading(s),
    }),
    dispatchToProps: dispatch => ({
      deleteNomineeRequest: () => dispatch(actions.etoNominee.deleteNomineeRequest()),
    }),
  }),
  branch<IStateProps>(({ isLoading }) => isLoading, renderComponent(LoadingIndicator)),
  branch<IStateProps & IExternalProps>(
    ({ currentNomineeId }) => currentNomineeId === undefined,
    renderComponent(ChooseNominee),
  ),
)(NomineeChosenComponent);

export { NomineeChosenComponent, Nominee };
