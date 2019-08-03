import * as React from "react";
import { FormattedMessage } from "react-intl-phraseapp";
import { branch, compose, renderComponent } from "recompose";

import { etoFormIsReadonly } from "../../../../../lib/api/eto/EtoApiUtils";
import {
  selectEtoNominee,
  selectEtoNomineeDisplayName,
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

interface IExternalProps {
  readonly: boolean;
}

interface IStateProps {
  currentNomineeId: string | undefined;
  currentNomineeName: string | undefined;
}

interface IComponentProps {
  currentNomineeId: string;
  currentNomineeName: string;
}

const NomineeChosenComponent: React.FunctionComponent<IExternalProps & IComponentProps> = ({
  readonly,
  currentNomineeName,
  currentNomineeId,
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
        <Button layout={EButtonLayout.PRIMARY} data-test-id="reject-nominee">
          <FormattedMessage id="eto.form.eto-nominee.reject" />
        </Button>
      </Section>
    )}
  </>
);

const Nominee = compose<IExternalProps & IComponentProps, IExternalProps>(
  appConnect<IStateProps>({
    stateToProps: s => ({
      currentNomineeId: selectEtoNominee(s),
      currentNomineeName: selectEtoNomineeDisplayName(s),
      readonly: etoFormIsReadonly(EEtoFormTypes.Nominee, selectIssuerEtoState(s)),
    }),
  }),
  withContainer(FormBase),
  branch<IStateProps>(
    ({ currentNomineeId }) => currentNomineeId === undefined,
    renderComponent(ChooseNominee),
  ),
)(NomineeChosenComponent);

export { NomineeChosenComponent, Nominee };
