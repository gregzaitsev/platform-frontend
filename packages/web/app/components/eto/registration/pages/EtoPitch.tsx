import * as React from "react";
import { FormattedMessage } from "react-intl-phraseapp";
import { setDisplayName } from "recompose";
import { compose } from "redux";
import * as Yup from 'yup';

import {
  EtoPitchType,
  TPartialCompanyEtoData,
} from "../../../../lib/api/eto/EtoApi.interfaces.unsafe";
import { actions } from "../../../../modules/actions";
import {
  selectIssuerCompany,
  selectIssuerEtoLoading,
  selectIssuerEtoSaving,
} from "../../../../modules/eto-flow/selectors";
import { EEtoFormTypes } from "../../../../modules/eto-flow/types";
import { appConnect } from "../../../../store";
import { Button, EButtonLayout } from "../../../shared/buttons";
import { ArrayOfKeyValueFields, FormFieldError, FormTextArea } from "../../../shared/forms/index";
import { FormHighlightGroup } from "../../../shared/forms/FormHighlightGroup";
import {
  convert,
  convertFractionToPercentage,
  convertInArray,
  convertPercentageToFraction,
  removeEmptyKeyValueFields, setEmptyKeyValueFieldsUndefined,
} from "../../utils";
import { EtoFormBase } from "../EtoFormBase";
import { Section } from "../Shared";

import * as styles from "../Shared.module.scss";
import { percentage } from "../../../../lib/api/util/customSchemas.unsafe";
import { ValidationError } from "yup";
import { yupToFormErrors } from "formik";

interface IStateProps {
  loadingData: boolean;
  savingData: boolean;
  stateValues: TPartialCompanyEtoData;
}

interface IDispatchProps {
  saveData: (values: TPartialCompanyEtoData) => void;
}

type IProps = IStateProps & IDispatchProps;

const distributionSuggestions = ["Development", "Other"];

const EtoCapitalListElementsRequired = Yup.object().shape({
  percent: percentage.required(),
  description: Yup.string().required()
});

const EtoCapitalListElementsNotRequired = Yup.object().shape({
  percent: percentage.notRequired(),
  description: Yup.string().notRequired()
});

const EtoCapitalListValidator = Yup.lazy(value => {
  console.log("EtoCapitalListValidator", value);
  if (value && (value['percent'] !== undefined || value['description'] !== undefined)) {
    return EtoCapitalListElementsRequired;
  } else {
    return EtoCapitalListElementsNotRequired;
  }
});

const validator = Yup.object().shape({
  problemSolved: Yup.string().meta({ isWysiwyg: true }),
  productVision: Yup.string().meta({ isWysiwyg: true }),
  inspiration: Yup.string().meta({ isWysiwyg: true }),
  roadmap: Yup.string().meta({ isWysiwyg: true }),
  useOfCapital: Yup.string(),
  useOfCapitalList: Yup.array().of(EtoCapitalListValidator).min(1, "please fill out at least one field").required("please fill out at least one field"),
  customerGroup: Yup.string().meta({ isWysiwyg: true }),
  sellingProposition: Yup.string().meta({ isWysiwyg: true }),
  marketingApproach: Yup.string().meta({ isWysiwyg: true }),
  companyMission: Yup.string().meta({ isWysiwyg: true }),
  targetMarketAndIndustry: Yup.string().meta({ isWysiwyg: true }),
  keyBenefitsForInvestors: Yup.string().meta({ isWysiwyg: true }),
  keyCompetitors: Yup.string().meta({ isWysiwyg: true }),
  marketTraction: Yup.string().meta({ isWysiwyg: true }),
  businessModel: Yup.string().meta({ isWysiwyg: true }),
});


const validationConversionSpec = {
  useOfCapitalList: setEmptyKeyValueFieldsUndefined()
};

const finalValidationConversionSpec = {
  useOfCapitalList: removeEmptyKeyValueFields()
};

const convertToFormikPath = (path: string) => {
  return path.replace(/\[(.+)\]/g, ".$1")
};

const EtoRegistrationPitchComponent = (props: IProps) => (
  <EtoFormBase
    title={<FormattedMessage id="eto.form-progress-widget.company-information.product-vision" />}
    validationSchema={EtoPitchType.toYup()}
    validate={(values) => {
      const convertedValues = convert(values, validationConversionSpec);
      console.log("convertedValues", values, convertedValues);
      try {
        validator.validateSync(convertedValues);
      } catch (e) {
        if (e instanceof ValidationError) {
          const err = yupToFormErrors(e);
          console.log("errors", err);
          err.inspiration = 'bla'
          return err

        }
      }
      const finalConvertedValues = convert(values, finalValidationConversionSpec)

      try {
        validator.validateSync(finalConvertedValues);
      } catch (e) {
        if (e instanceof ValidationError) {
          const err = { [convertToFormikPath(e.path)]: e.message };
          console.log("final errors", e, err);
          err.inspiration = 'bla'

          return err
        }
      }
    }}

    initialValues={convert(props.stateValues, toFormState)}
    onSubmit={props.saveData}
  >
    <Section>
      <FormTextArea
        className="my-2"
        label={<FormattedMessage id="eto.form.product-vision.inspiration" />}
        placeholder="Describe"
        name="inspiration"
      />

      <FormTextArea
        className="my-2"
        label={<FormattedMessage id="eto.form.product-vision.company-mission" />}
        placeholder="Describe"
        name="companyMission"
      />

      <FormTextArea
        className="my-2"
        label={<FormattedMessage id="eto.form.product-vision.product-vision" />}
        placeholder="Describe"
        name="productVision"
      />

      <FormTextArea
        className="my-2"
        label={<FormattedMessage id="eto.form.product-vision.problem-solved" />}
        placeholder="Describe"
        name="problemSolved"
      />

      <FormTextArea
        className="my-2"
        label={<FormattedMessage id="eto.form.product-vision.customer-group" />}
        placeholder="Describe"
        name="customerGroup"
      />

      <FormTextArea
        className="my-2"
        label={<FormattedMessage id="eto.form.product-vision.target-market-and-industry" />}
        placeholder="Describe"
        name="targetMarketAndIndustry"
      />

      <FormTextArea
        className="my-2"
        label={<FormattedMessage id="eto.form.product-vision.key-competitors" />}
        placeholder="Describe"
        name="keyCompetitors"
      />

      <FormTextArea
        className="my-2"
        label={<FormattedMessage id="eto.form.product-vision.selling-proposition" />}
        placeholder="Describe"
        name="sellingProposition"
      />

      <FormTextArea
        className="my-2"
        label={<FormattedMessage id="eto.form.product-vision.key-benefits-for-investors" />}
        placeholder="Describe"
        name="keyBenefitsForInvestors"
      />
      <FormHighlightGroup title={<FormattedMessage id="eto.form.product-vision.use-of-capital" />}>
        <FormTextArea name="useOfCapital" placeholder="Detail" disabled={false} />
        <ArrayOfKeyValueFields
          name="useOfCapitalList"
          suggestions={distributionSuggestions}
          prefix="%"
          transformRatio={100}
          fieldNames={["description", "percent"]}
        />
        <FormFieldError name={"useOfCapitalList"} />
      </FormHighlightGroup>

      <FormTextArea
        className="my-2"
        label={<FormattedMessage id="eto.form.product-vision.market-traction" />}
        placeholder="Describe"
        name="marketTraction"
      />

      <FormTextArea
        className="my-2"
        label={<FormattedMessage id="eto.form.product-vision.roadmap" />}
        placeholder="Describe"
        name="roadmap"
      />

      <FormTextArea
        className="my-2"
        label={<FormattedMessage id="eto.form.product-vision.business-model" />}
        placeholder="Describe"
        name="businessModel"
      />

      <FormTextArea
        className="my-2"
        label={<FormattedMessage id="eto.form.product-vision.marketing-approach" />}
        placeholder="Describe"
        name="marketingApproach"
      />
    </Section>
    <Section className={styles.buttonSection}>
      <Button
        layout={EButtonLayout.PRIMARY}
        type="submit"
        isLoading={props.savingData}
        data-test-id="eto-registration-product-vision-submit"
      >
        Save
      </Button>
    </Section>
  </EtoFormBase>
);

const EtoRegistrationPitch = compose<React.FunctionComponent>(
  setDisplayName(EEtoFormTypes.ProductVision),
  appConnect<IStateProps, IDispatchProps>({
    stateToProps: s => ({
      loadingData: selectIssuerEtoLoading(s),
      savingData: selectIssuerEtoSaving(s),
      stateValues: selectIssuerCompany(s) as TPartialCompanyEtoData,
    }),
    dispatchToProps: dispatch => ({
      saveData: (company: TPartialCompanyEtoData) => {
        const convertedCompany = convert(company, fromFormState);
        dispatch(actions.etoFlow.saveCompanyStart(convertedCompany));
      },
    }),
  }),
)(EtoRegistrationPitchComponent);

const toFormState = {
  useOfCapitalList: [convertInArray({ percent: convertFractionToPercentage() })],
};

const fromFormState = {
  useOfCapitalList: [
    removeEmptyKeyValueFields(),
    convertInArray({ percent: convertPercentageToFraction() }),
  ],
};

export { EtoRegistrationPitch, EtoRegistrationPitchComponent };
