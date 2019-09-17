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
  convertLater, convertPercentageToFraction,
  removeEmptyKeyValueFields, setEmptyKeyValueFieldsUndefined
} from "../../../utils";
import { actions } from "../../../../../modules/actions";
import { EtoRegistrationPitchComponent } from "./EtoPitch";
import * as Yup from "yup";
import { NumberSchema } from "yup";
import { StringSchema } from "yup";
import { percentage } from "../../../../../lib/api/util/customSchemas.unsafe";
import { ObjectSchema } from "yup";
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
  percent: NumberSchema,
  description: StringSchema
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
    return EtoCapitalListRequired as ObjectSchema<EEtoCapitalListSchema>;
  } else {
    return EtoCapitalListNotRequired as ObjectSchema<EEtoCapitalListSchema>;
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

const EtoRegistrationPitch = compose<TComponentProps & TDispatchProps,{}>(
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
  withProps<TWithProps,TStateProps>((p) => ({
    initialValues: convert(p.stateValues, toFormState),
    validationSpecs:[
      { validator, conversionFn: convertLater(validationConversionSpec) },
      { validator, conversionFn: convertLater(finalValidationConversionSpec) }
    ]
  }))
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

export {EtoRegistrationPitch}
