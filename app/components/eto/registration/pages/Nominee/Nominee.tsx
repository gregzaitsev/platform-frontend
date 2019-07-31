import * as React from "react";
import { FormattedMessage } from "react-intl-phraseapp";
import { branch, setDisplayName, renderComponent } from "recompose";
import { compose } from "recompose";

import { TPartialEtoSpecData } from "../../../../../lib/api/eto/EtoApi.interfaces.unsafe";
import { etoFormIsReadonly } from "../../../../../lib/api/eto/EtoApiUtils";
import { actions } from "../../../../../modules/actions";
import {
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

import * as styles from "../../Shared.module.scss";

interface IExternalProps {
  readonly: boolean;
}

interface IStateProps {
  loadingData: boolean;
  savingData: boolean;
  currentNominee: string | undefined;
  currentNomineeName: string | undefined
}

interface IComponentProps {
  loadingData: boolean;
  savingData: boolean;
  currentNominee: string;
  currentNomineeName: string
}

interface IDispatchProps {
  saveData: (values: TPartialEtoSpecData) => void;
}

type IProps = IExternalProps & IComponentProps & IDispatchProps;

const NomineeChosenComponent: React.FunctionComponent<IProps> = ({ readonly, savingData,currentNomineeName }) => (
  <>
    <Section>
      <div className="" >
        {currentNomineeName}
      </div>
    </Section>
    {/* todo cancel button*/}
    {!readonly && (
      <Section className={styles.buttonSection}>
        <Button
          layout={EButtonLayout.PRIMARY}
          type="submit"
          isLoading={savingData}
          data-test-id="eto-nominee-submit"
        >
          <FormattedMessage id="form.button.save" />
        </Button>
      </Section>
    )}
  </>
);

const Nominee = compose<IProps, IExternalProps>(
  setDisplayName(EEtoFormTypes.EtoVotingRights),
  appConnect<IStateProps, IDispatchProps>({
    stateToProps: s => ({
      loadingData: s.etoFlow.loading,
      savingData: s.etoFlow.saving,
      currentNominee: undefined,//selectEtoNominee(s), //fixme for now api always returns a default nominee
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
  branch<IStateProps>(({ currentNominee }) => currentNominee === undefined, renderComponent(ChooseNominee))
)(NomineeChosenComponent);

const fromFormState = {
  liquidationPreferenceMultiplier: parseStringToFloat(),
};

export { NomineeChosenComponent, Nominee };
