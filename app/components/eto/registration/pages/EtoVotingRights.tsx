import { withFormik } from "formik";
import * as React from "react";
import { FormattedMessage, FormattedHTMLMessage } from "react-intl-phraseapp";
import { branch, setDisplayName, renderNothing } from "recompose";
import { compose } from "recompose";

import {
  EtoVotingRightsType,
  TPartialEtoSpecData,
} from "../../../../lib/api/eto/EtoApi.interfaces.unsafe";
import { etoFormIsReadonly } from "../../../../lib/api/eto/EtoApiUtils";
import { actions } from "../../../../modules/actions";
import { selectIssuerEto, selectIssuerEtoState } from "../../../../modules/eto-flow/selectors";
import { EEtoFormTypes } from "../../../../modules/eto-flow/types";
import { appConnect } from "../../../../store";
import { Button, EButtonLayout } from "../../../shared/buttons";
import { FormSelectField } from "../../../shared/forms/index";
import { FormFieldLabel } from "../../../shared/forms/fields/FormFieldLabel";
import { FormToggle } from "../../../shared/forms/fields/FormToggle.unsafe";
import { applyDefaults, convert, parseStringToFloat } from "../../utils";
import { EtoFormBase } from "../EtoFormBase.unsafe";
import { Section } from "../Shared";
import { FormHighlightGroup } from "../../../shared/forms/FormHighlightGroup";

import * as styles from "../Shared.module.scss";
import { externalRoutes } from "../../../../config/externalRoutes";
import { selectUserId } from "../../../../modules/auth/selectors";
import { AccountAddress } from "../../../shared/AccountAddress";

const LIQUIDATION_PREFERENCE_VALUES = [0, 1, 1.5, 2];

const defaults = {
  liquidationPreferenceMultiplier: 0,
  generalVotingRule: "positive",
};

interface IExternalProps {
  readonly: boolean;
}

interface IStateProps {
  loadingData: boolean;
  savingData: boolean;
  stateValues: TPartialEtoSpecData;
  issuerId: string | undefined
}

interface IComponentProps {
  loadingData: boolean;
  savingData: boolean;
  stateValues: TPartialEtoSpecData;
  issuerId: string
}

interface IDispatchProps {
  saveData: (values: TPartialEtoSpecData) => void;
}

type IProps = IExternalProps & IComponentProps & IDispatchProps;

const EtoVotingRightsComponent: React.FunctionComponent<IProps> = ({ readonly, savingData, issuerId }) => (
  <EtoFormBase
    title={<FormattedMessage id="eto.form.eto-voting-rights.title" />}
    validator={EtoVotingRightsType.toYup()}
  >
    <Section>
      <FormFieldLabel name="nominee">
        <FormattedMessage id="eto.form.section.token-holders-rights.nominee" />
      </FormFieldLabel>
      <p>
        <FormattedHTMLMessage
          tagName="span"
          id="eto.form.section.token-holders-rights.eto-id-text"
          values={{ href: externalRoutes.neufundSupportHome }} />
      </p>

      <FormHighlightGroup>
        <AccountAddress address={issuerId} data-test-id="issuer-id"/>
      </FormHighlightGroup>

      <FormSelectField
        customOptions={LIQUIDATION_PREFERENCE_VALUES.map(n => (
          <option key={n} value={n}>
            {n}
          </option>
        ))}
        label={
          <FormattedMessage id="eto.form.section.token-holders-rights.liquidation-preference" />
        }
        name="liquidationPreferenceMultiplier"
        disabled={readonly}
      />

      <div className="form-group">
        <FormFieldLabel name="generalVotingRule">
          <FormattedMessage id="eto.form.section.token-holders-rights.voting-rights-enabled" />
        </FormFieldLabel>
        <FormToggle
          name="generalVotingRule"
          trueValue="positive"
          falseValue="no_voting_rights"
          disabledLabel={<FormattedMessage id="form.select.no" />}
          enabledLabel={<FormattedMessage id="form.select.yes" />}
          disabled={readonly}
        />
      </div>
    </Section>

    {!readonly && (
      <Section className={styles.buttonSection}>
        <Button
          layout={EButtonLayout.PRIMARY}
          type="submit"
          isLoading={savingData}
          data-test-id="eto-registration-voting-rights-submit"
        >
          <FormattedMessage id="form.button.save" />
        </Button>
      </Section>
    )}
  </EtoFormBase>
);

const EtoVotingRights = compose<IProps, IExternalProps>(
  setDisplayName(EEtoFormTypes.EtoVotingRights),
  appConnect<IStateProps | null, IDispatchProps>({
    stateToProps: s => {
      const issuerId = selectUserId(s)
      if (issuerId !== undefined) {
        return ({
          loadingData: s.etoFlow.loading,
          savingData: s.etoFlow.saving,
          stateValues: selectIssuerEto(s) as TPartialEtoSpecData,
          readonly: etoFormIsReadonly(EEtoFormTypes.EtoVotingRights, selectIssuerEtoState(s)),
          issuerId: selectUserId(s)
        })
      } else {
        return null
      }
    },
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
  branch<IStateProps | null>(props => props === null, renderNothing),
  withFormik<IProps, TPartialEtoSpecData>({
    validationSchema: EtoVotingRightsType.toYup(),
    mapPropsToValues: props => applyDefaults(props.stateValues, defaults),
    handleSubmit: (values, props) => props.props.saveData(values),
  }),
)(EtoVotingRightsComponent);

const fromFormState = {
  liquidationPreferenceMultiplier: parseStringToFloat(),
};

export { EtoVotingRightsComponent, EtoVotingRights };
