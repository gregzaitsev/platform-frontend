import * as React from "react";
import { FormattedMessage } from "react-intl-phraseapp";
import { setDisplayName } from "recompose";
import { compose } from "redux";

import {
  EtoLegalInformationType,
  TPartialCompanyEtoData,
} from "../../../../lib/api/eto/EtoApi.interfaces.unsafe";
import { actions } from "../../../../modules/actions";
import { selectIssuerCompany } from "../../../../modules/eto-flow/selectors";
import { EEtoFormTypes } from "../../../../modules/eto-flow/types";
import { appConnect } from "../../../../store";
import { Button, EButtonLayout } from "../../../shared/buttons";
import {
  ECurrency,
  ENumberInputFormat,
  ENumberOutputFormat,
} from "../../../shared/formatters/utils";
import { ArrayOfKeyValueFields } from "../../../shared/forms/fields/FormCategoryDistribution.unsafe";
import { FormField } from "../../../shared/forms/fields/FormField";
import { FormFieldDate } from "../../../shared/forms/fields/FormFieldDate";
import { FormMaskedNumberInput } from "../../../shared/forms/fields/FormMaskedNumberInput";
import { FormSelectField } from "../../../shared/forms/fields/FormSelectField";
import { FormTextArea } from "../../../shared/forms/fields/FormTextArea";
import { FormHighlightGroup } from "../../../shared/forms/FormHighlightGroup";
import { FUNDING_ROUNDS } from "../../constants";
import {
  convert,
  convertInArray,
  convertNumberToString,
  parseStringToFloat,
  parseStringToInteger,
  removeEmptyKeyValueFields,
} from "../../utils";
import { EtoFormBase } from "../EtoFormBase";
import { Section } from "../Shared";

import * as styles from "../Shared.module.scss";

interface IStateProps {
  loadingData: boolean;
  savingData: boolean;
  company: TPartialCompanyEtoData;
}

interface IExternalProps {
  readonly: boolean;
}

interface IDispatchProps {
  saveData: (values: TPartialCompanyEtoData) => void;
}

const NUMBER_OF_EMPLOYEES = {
  NONE_KEY: <FormattedMessage id="form.select.please-select" />,
  "1-9": "1-9",
  "10-99": "10-99",
  "100-999": "100-999",
  ">1000": ">1000",
};

type IProps = IExternalProps & IStateProps & IDispatchProps;

// Some fields in LegalInformation are always readonly because data are set during KYC process
const EtoRegistrationLegalInformationComponent = ({ savingData, company, saveData }: IProps) => (
  <EtoFormBase
    data-test-id="eto.form.legal-information"
    title="Legal Information"
    validationSchema={EtoLegalInformationType.toYup()}
    initialValues={convert(company, toFormState)}
    onSubmit={saveData}
  >
    <Section>
      <FormField
        label={<FormattedMessage id="eto.form.legal-information.legal-company-name" />}
        name="name"
        disabled={true}
      />
      <FormField
        label={<FormattedMessage id="eto.form.legal-information.legal-form" />}
        name="legalForm"
        disabled={true}
      />
      <FormTextArea
        label={<FormattedMessage id="eto.form.legal-information.company-legal-description" />}
        name="companyLegalDescription"
        placeholder="Please enter the legal purpose of the entity stated in your incorporation documents."
      />
      <FormField
        label={<FormattedMessage id="eto.form.legal-information.company-state-address" />}
        name="street"
        disabled={true}
      />
      <FormField
        label={<FormattedMessage id="eto.form.legal-information.city-country" />}
        name="country"
        disabled={true}
      />
      <FormField
        label={<FormattedMessage id="eto.form.legal-information.registration-number" />}
        name="registrationNumber"
        disabled={true}
      />
      <FormField
        label={<FormattedMessage id="eto.form.legal-information.vat-number" />}
        name="vatNumber"
      />
      <FormFieldDate
        label={<FormattedMessage id="eto.form.legal-information.company-founding-date" />}
        name="foundingDate"
      />
      <FormSelectField
        label={<FormattedMessage id="eto.form.legal-information.number-of-employees" />}
        values={NUMBER_OF_EMPLOYEES}
        name="numberOfEmployees"
      />
      <FormMaskedNumberInput
        name="numberOfFounders"
        storageFormat={ENumberInputFormat.FLOAT}
        outputFormat={ENumberOutputFormat.INTEGER}
        label={<FormattedMessage id="eto.form.legal-information.number-of-founders" />}
      />
      <FormSelectField
        label={<FormattedMessage id="eto.form.legal-information.last-funding-round" />}
        values={FUNDING_ROUNDS}
        name="companyStage"
      />
      <FormMaskedNumberInput
        name="lastFundingSizeEur"
        storageFormat={ENumberInputFormat.FLOAT}
        outputFormat={ENumberOutputFormat.FULL}
        valueType={ECurrency.EUR}
        showUnits={true}
        label={<FormattedMessage id="eto.form.legal-information.last-funding-amount" />}
      />
      <FormMaskedNumberInput
        name="companyShareCapital"
        storageFormat={ENumberInputFormat.FLOAT}
        outputFormat={ENumberOutputFormat.INTEGER}
        valueType={undefined}
        label={<FormattedMessage id="eto.form.legal-information.amount-of-share-capital" />}
      />
      <FormField
        label={<FormattedMessage id="eto.form.legal-information.share-capital-currency-code" />}
        name="shareCapitalCurrencyCode"
      />
      <FormHighlightGroup
        title={<FormattedMessage id="eto.form.legal-information.shareholder-structure" />}
      >
        <ArrayOfKeyValueFields
          name="shareholders"
          valuePlaceholder={"Share capital"}
          suggestions={["Full Name"]}
          fieldNames={["fullName", "shareCapital"]}
        />
      </FormHighlightGroup>
    </Section>
    <Section className={styles.buttonSection}>
      <Button
        type="submit"
        layout={EButtonLayout.PRIMARY}
        isLoading={savingData}
        data-test-id="eto-registration-legal-information-submit"
      >
        <FormattedMessage id="form.button.save" />
      </Button>
    </Section>
  </EtoFormBase>
);

const EtoRegistrationLegalInformation = compose<React.FunctionComponent<IExternalProps>>(
  setDisplayName(EEtoFormTypes.LegalInformation),
  appConnect<IStateProps, IDispatchProps>({
    stateToProps: state => ({
      loadingData: state.etoIssuer.loading,
      savingData: state.etoIssuer.saving,
      company: selectIssuerCompany(state) as TPartialCompanyEtoData,
    }),
    dispatchToProps: dispatch => ({
      saveData: (company: TPartialCompanyEtoData) => {
        const convertedCompany = convert(company, fromFormState);
        dispatch(actions.etoFlow.saveCompanyStart(convertedCompany));
      },
    }),
  }),
)(EtoRegistrationLegalInformationComponent);

const toFormState = {
  companyShareCapital: convertNumberToString(),
  numberOfFounders: convertNumberToString(),
  lastFundingSizeEur: convertNumberToString(),
};

const fromFormState = {
  shareholders: [
    removeEmptyKeyValueFields(),
    convertInArray({ shareCapital: parseStringToInteger() }),
  ],
  companyShareCapital: parseStringToInteger(),
  lastFundingSizeEur: parseStringToFloat(),
  numberOfFounders: parseStringToInteger(),
};

export { EtoRegistrationLegalInformation, EtoRegistrationLegalInformationComponent };
