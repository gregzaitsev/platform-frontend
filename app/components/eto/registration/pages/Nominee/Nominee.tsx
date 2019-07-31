import * as React from "react";
import { FormattedMessage } from "react-intl-phraseapp";
import { branch, renderComponent } from "recompose";
import { compose } from "recompose";

import { TPartialEtoSpecData } from "../../../../../lib/api/eto/EtoApi.interfaces.unsafe";
import { etoFormIsReadonly } from "../../../../../lib/api/eto/EtoApiUtils";
import { actions } from "../../../../../modules/actions";
import {
  selectEtoNominee,
  selectEtoNomineeDisplayName,
  selectIssuerEtoState
} from "../../../../../modules/eto-flow/selectors";
import { EEtoFormTypes } from "../../../../../modules/eto-flow/types";
import { appConnect } from "../../../../../store";
import { Button, EButtonLayout } from "../../../../shared/buttons/index";
import { convert, parseStringToFloat } from "../../../utils";
import { Section } from "../../Shared";
import { withContainer } from "../../../../../utils/withContainer.unsafe";
import { FormBase } from "./FormBase";
import { ChooseNominee } from "./ChooseNominee";

import * as styles from "./Nominee.module.scss";

interface IExternalProps {
  readonly: boolean;
}

interface IStateProps {
  loadingData: boolean;
  savingData: boolean;
  currentNomineeId: string | undefined;
  currentNomineeName: string | undefined
}

interface IComponentProps {
  loadingData: boolean;
  savingData: boolean;
  currentNomineeId: string;
  currentNomineeName: string
}

interface IDispatchProps {
  saveData: (values: TPartialEtoSpecData) => void;
}

type IProps = IExternalProps & IComponentProps & IDispatchProps;

const NomineeChosenComponent: React.FunctionComponent<IProps> = ({ readonly,currentNomineeName,currentNomineeId }) => (
  <>
      <p className={styles.text}>
        <FormattedMessage id="eto.form.eto-nominee.text"/>
      </p>
      <div className={styles.nomineeBlock} >
        <span>{currentNomineeId}</span>
        <span>{currentNomineeName}</span>
      </div>
    {/* todo cancel button*/}
    {!readonly && (
      <Section className={styles.buttonSection}>
        <Button
          layout={EButtonLayout.PRIMARY}
          data-test-id="reject-nominee"
        >
          <FormattedMessage id="eto.form.eto-nominee.reject"/>
        </Button>
      </Section>
    )}
  </>
);

const Nominee = compose<IProps, IExternalProps>(
  appConnect<IStateProps, IDispatchProps>({
    stateToProps: s => ({
      loadingData: s.etoFlow.loading,
      savingData: s.etoFlow.saving,
      currentNomineeId: selectEtoNominee(s), //fixme for now api always returns a default nominee
      currentNomineeName: selectEtoNomineeDisplayName(s),
      readonly: etoFormIsReadonly(EEtoFormTypes.Nominee, selectIssuerEtoState(s)),
    }),
    dispatchToProps: dispatch => ({
      saveData: (data: TPartialEtoSpecData) => {
        const convertedData = convert(data, fromFormState);
        dispatch(
          actions.etoFlow.saveDataStart({
            companyData: {},
            etoData: convertedData,
          }),
        );
      },
    }),
  }),
  withContainer(FormBase),
  branch<IStateProps>(({ currentNomineeId }) => currentNomineeId === undefined, renderComponent(ChooseNominee))
)(NomineeChosenComponent);

const fromFormState = {
  liquidationPreferenceMultiplier: parseStringToFloat(),
};

export { NomineeChosenComponent, Nominee };
