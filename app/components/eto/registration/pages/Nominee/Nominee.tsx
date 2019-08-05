import * as React from "react";
import { FormattedMessage } from "react-intl-phraseapp";
import { branch, compose, renderComponent } from "recompose";

import { etoFormIsReadonly } from "../../../../../lib/api/eto/EtoApiUtils";
import {
  selectEtoNominee,
  selectEtoNomineeDisplayName, selectIssuerEtoLoading,
  selectIssuerEtoState,
} from "../../../../../modules/eto-flow/selectors";
import { EEtoFormTypes } from "../../../../../modules/eto-flow/types";
import { appConnect } from "../../../../../store";
import { withContainer } from "../../../../../utils/withContainer.unsafe";
import { Button, EButtonLayout } from "../../../../shared/buttons/index";
import { Section } from "../../Shared";
import { ChooseNominee } from "./ChooseNominee";
import { FormBase } from "./FormBase";

import * as styles from "./Nominee.module.scss";
import { actions } from "../../../../../modules/actions";
import { selectEtoNomineeIsLoading } from "../../../../../modules/eto-nominee/selectors";
import { LoadingIndicator } from "../../../../shared/loading-indicator/LoadingIndicator";

interface IExternalProps {
  readonly: boolean;
}

interface IStateProps {
  currentNomineeId: string | undefined;
  currentNomineeName: string | undefined;
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
  deleteNomineeRequest
}) => (
  <>
    <p className={styles.text}>
      <FormattedMessage id="eto.form.eto-nominee.text" />
    </p>
    <div className={styles.nomineeBlock}>
      <span>{currentNomineeId}</span>
      <span>{currentNomineeName}</span>
    </div>
    {/* todo cancel button*/}
    {!readonly && (
      <Section className={styles.buttonSection}>
        <Button
          layout={EButtonLayout.PRIMARY}
          data-test-id="delete-nominee-request"
          onClick={deleteNomineeRequest}
        >
          <FormattedMessage id="eto.form.eto-nominee.cancel-request" />
        </Button>
      </Section>
    )}
  </>
);

const Nominee = compose<IExternalProps & IComponentProps, IExternalProps>(
  appConnect<IStateProps, IDispatchProps>({
    stateToProps: s => ({
      isLoading: selectEtoNomineeIsLoading(s) || selectIssuerEtoLoading(s),
      currentNomineeId: selectEtoNominee(s),
      currentNomineeName: selectEtoNomineeDisplayName(s),
      readonly: etoFormIsReadonly(EEtoFormTypes.Nominee, selectIssuerEtoState(s)),
    }),
    dispatchToProps: dispatch => ({
      deleteNomineeRequest: () => dispatch(actions.etoNominee.deleteNomineeRequest())
    })
  }),
  withContainer(FormBase),
  branch<IStateProps>(({ isLoading }) => isLoading, renderComponent(LoadingIndicator)),
  branch<IStateProps>(
    ({ currentNomineeId }) => currentNomineeId === undefined,
    renderComponent(ChooseNominee),
  ),
)(NomineeChosenComponent);

export { NomineeChosenComponent, Nominee };
