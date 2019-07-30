import * as React from "react";
import { FormattedMessage, FormattedHTMLMessage } from "react-intl-phraseapp";
import { branch, setDisplayName, renderNothing } from "recompose";
import { compose } from "recompose";

import {  TPartialEtoSpecData } from "../../../../lib/api/eto/EtoApi.interfaces.unsafe";
import { etoFormIsReadonly } from "../../../../lib/api/eto/EtoApiUtils";
import { actions } from "../../../../modules/actions";
import { selectIssuerEto, selectIssuerEtoState } from "../../../../modules/eto-flow/selectors";
import { EEtoFormTypes } from "../../../../modules/eto-flow/types";
import { appConnect } from "../../../../store";
import { Button, EButtonLayout } from "../../../shared/buttons";
import { FormFieldLabel } from "../../../shared/forms/fields/FormFieldLabel";
import { convert, parseStringToFloat } from "../../utils";
import { Section } from "../Shared";
import { FormHighlightGroup } from "../../../shared/forms/FormHighlightGroup";
import { externalRoutes } from "../../../../config/externalRoutes";
import { selectUserId } from "../../../../modules/auth/selectors";
import { AccountAddress } from "../../../shared/AccountAddress";
import { Form } from "../../../shared/forms/Form";

import * as styles from "../Shared.module.scss";


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

const NomineeComponent: React.FunctionComponent<IProps> = ({ readonly, savingData, issuerId }) => (

  <Form className={styles.form}>
    <h4 className={styles.header}>
      <FormattedMessage id="eto.form.eto-voting-rights.title" />
    </h4>

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
        <AccountAddress address={issuerId} data-test-id="issuer-id" />
      </FormHighlightGroup>


    </Section>

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
  </Form>
);

const Nominee = compose<IProps, IExternalProps>(
  setDisplayName(EEtoFormTypes.EtoVotingRights),
  appConnect<IStateProps | null, IDispatchProps>({
    stateToProps: s => {
      const issuerId = selectUserId(s);
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
)(NomineeComponent);

const fromFormState = {
  liquidationPreferenceMultiplier: parseStringToFloat(),
};

export { NomineeComponent, Nominee };
