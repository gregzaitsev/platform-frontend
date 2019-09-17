import * as Yup from "yup";
import { compose, setDisplayName, withProps } from "recompose";

import { EEtoFormTypes } from "../../../../../modules/eto-flow/types";
import { appConnect } from "../../../../../store";
import {
  selectIssuerCompany,
  selectIssuerEtoLoading,
  selectIssuerEtoSaving
} from "../../../../../modules/eto-flow/selectors";
import { TPartialCompanyEtoData } from "../../../../../lib/api/eto/EtoApi.interfaces.unsafe";
import {
  convert,
  convertFractionToPercentage,
  convertInArray,
  convertLater, convertNumberToString, convertPercentageToFraction, parseStringToFloat,
  removeEmptyKeyValueFields, setEmptyKeyValueFieldsUndefined
} from "../../../utils";
import { actions } from "../../../../../modules/actions";
import { percentage } from "../../../../../lib/api/util/customSchemas.unsafe";
import { TConversionAndValidationSpec } from "../../../../shared/forms/utils";

type TDispatchProps = {
  saveData: (values: TPartialCompanyEtoData) => void;
}

type TWithProps = {
  initialValues: TPartialCompanyEtoData,
  validationSpecs: TConversionAndValidationSpec<TPartialCompanyEtoData>[]
}

export type TComponentProps = {
  loadingData: boolean;
  savingData: boolean;
} & TWithProps

type TStateProps = {
  loadingData: boolean;
  savingData: boolean;
  stateValues: TPartialCompanyEtoData;
}

type EEtoCapitalListSchema = {
  percent: Yup.NumberSchema,
  description: Yup.StringSchema
}

const EtoCapitalListRequired = Yup.object().shape({
  percent: percentage.required(),
  description: Yup.string().required()
});

const EtoCapitalListNotRequired = Yup.object().shape({
  percent: percentage.notRequired(),
  description: Yup.string().notRequired()
});

const EtoCapitalListValidator = Yup.lazy((value: EEtoCapitalListSchema) => {
  if (value && (value['percent'] !== undefined || value['description'] !== undefined)) {
    return EtoCapitalListRequired as Yup.ObjectSchema<EEtoCapitalListSchema>;
  } else {
    return EtoCapitalListNotRequired as Yup.ObjectSchema<EEtoCapitalListSchema>;
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

const percentConversionSpec = [parseStringToFloat({passThroughInvalidData:true}), convertPercentageToFraction({passThroughInvalidData:true})];

const validationConversionSpec = {
  useOfCapitalList: [setEmptyKeyValueFieldsUndefined(),
    convertInArray({ percent: percentConversionSpec })]
};

const finalValidationConversionSpec = {
  useOfCapitalList: [removeEmptyKeyValueFields(),
    convertInArray({ percent: percentConversionSpec })]
};

const connectEtoRegistrationPitch = (WrappedComponent: React.FunctionComponent<TComponentProps & TDispatchProps>) =>
  compose<TComponentProps & TDispatchProps, {}>(
    setDisplayName(EEtoFormTypes.ProductVision),
    appConnect<TStateProps, TDispatchProps>({
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
    withProps<TWithProps, TStateProps & TDispatchProps>((p) => ({
      initialValues: convert(p.stateValues, toFormState),
      validationSpecs: [
        { validator, conversionFn: convertLater(validationConversionSpec) },
        { validator, conversionFn: convertLater(finalValidationConversionSpec) }
      ]
    }))
  )(WrappedComponent);

const toFormState = {
  useOfCapitalList: [convertInArray({ percent: [convertFractionToPercentage(), convertNumberToString()] })],
};

const fromFormState = {
  useOfCapitalList: [
    removeEmptyKeyValueFields(),
    convertInArray({ percent: [parseStringToFloat(), convertPercentageToFraction()] }),
  ],
};

export { connectEtoRegistrationPitch }
