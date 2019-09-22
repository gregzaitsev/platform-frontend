import { FormikValues } from "formik";
import * as React from "react";
import { FormattedMessage } from "react-intl-phraseapp";
import { compose, setDisplayName, withProps } from "recompose";
import * as Yup from "yup";

import { TPartialCompanyEtoData } from "../../../../../lib/api/eto/EtoApi.interfaces.unsafe";
import { percentage } from "../../../../../lib/api/util/customSchemas.unsafe";
import { actions } from "../../../../../modules/actions";
import {
  selectIssuerCompany,
  selectIssuerEtoLoading,
  selectIssuerEtoSaving,
} from "../../../../../modules/eto-flow/selectors";
import { EEtoFormTypes } from "../../../../../modules/eto-flow/types";
import { appConnect } from "../../../../../store";
import {
  convertAndValidatePipeline,
  replaceValidatorWith,
  transformValidator,
} from "../../../../shared/forms/utils";
import {
  convert,
  convertFractionToPercentage,
  convertInArray,
  convertNumberToString,
  convertPercentageToFraction,
  convertPercentageToFractionNonStrict,
  parseStringToFloat,
  parseStringToFloatNonStrict,
  removeEmptyKeyValueFields,
  setEmptyKeyValueFieldsUndefined,
} from "../../../utils";

type TDispatchProps = {
  saveData: (values: TPartialCompanyEtoData) => void;
};

type TWithProps = {
  initialValues: TPartialCompanyEtoData;
  validationFn: (values: FormikValues) => void;
};

export type TComponentProps = {
  loadingData: boolean;
  savingData: boolean;
} & TWithProps;

type TStateProps = {
  loadingData: boolean;
  savingData: boolean;
  stateValues: TPartialCompanyEtoData;
};

type TEtoCapitalListSchema = {
  percent: Yup.NumberSchema;
  description: Yup.StringSchema;
};

const EtoCapitalListRequired = Yup.object().shape({
  percent: percentage.required(),
  description: Yup.string().required(),
});

const EtoCapitalListNotRequired = Yup.object().shape({
  percent: percentage.notRequired(),
  description: Yup.string().notRequired(),
});

const EtoCapitalListValidator = Yup.lazy((value: TEtoCapitalListSchema) => {
  if (value && (value["percent"] !== undefined || value["description"] !== undefined)) {
    return EtoCapitalListRequired as Yup.ObjectSchema<TEtoCapitalListSchema>;
  } else {
    return EtoCapitalListNotRequired as Yup.ObjectSchema<TEtoCapitalListSchema>;
  }
});

const validator = Yup.object().shape({
  problemSolved: Yup.string(),
  productVision: Yup.string(),
  inspiration: Yup.string(),
  roadmap: Yup.string(),
  useOfCapital: Yup.string().required(),
  useOfCapitalList: Yup.array()
    .of(EtoCapitalListValidator)
    .min(1, <FormattedMessage id="form.field.error.array.at-least-one-entry-required" />)
    .required(<FormattedMessage id="form.field.error.array.at-least-one-entry-required" />),
  customerGroup: Yup.string(),
  sellingProposition: Yup.string(),
  marketingApproach: Yup.string(),
  companyMission: Yup.string(),
  targetMarketAndIndustry: Yup.string(),
  keyBenefitsForInvestors: Yup.string(),
  keyCompetitors: Yup.string(),
  marketTraction: Yup.string(),
  businessModel: Yup.string(),
});

const percentConversionSpec = [
  parseStringToFloatNonStrict(),
  convertPercentageToFractionNonStrict(),
];
const amountOfCapitalListValidator = Yup.number()
  .min(1, <FormattedMessage id="form.field.error.allocation-of-100-percents-of-funds" />)
  .required(<FormattedMessage id="form.field.error.allocation-of-100-percents-of-funds" />)
  .max(1, <FormattedMessage id="form.field.error.cannot-be-more-than-100-percent" />);

const validatorConversionSpec = {
  useOfCapitalList: replaceValidatorWith(amountOfCapitalListValidator),
};

const conversionSpec0 = {
  useOfCapitalList: [
    setEmptyKeyValueFieldsUndefined(),
    convertInArray({ percent: percentConversionSpec }),
  ],
};

const conversionSpec1 = {
  useOfCapitalList: [
    removeEmptyKeyValueFields(),
    convertInArray({ percent: percentConversionSpec }),
  ],
};

const conversion2 = (data: TPartialCompanyEtoData) => {
  const dataCopy = convert(conversionSpec1)(data);

  if (dataCopy.useOfCapitalList) {
    dataCopy.useOfCapitalList = dataCopy.useOfCapitalList.reduce(
      (acc: number, { percent }: { percent: number }) => (acc += percent),
      0,
    );
  }
  return dataCopy;
};

const connectEtoRegistrationPitch = (
  WrappedComponent: React.FunctionComponent<TComponentProps & TDispatchProps>,
) =>
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
          const convertedCompany = convert(fromFormState)(company);
          dispatch(actions.etoFlow.saveCompanyStart(convertedCompany));
        },
      }),
    }),
    withProps<TWithProps, TStateProps & TDispatchProps>(({ stateValues }) => ({
      initialValues: convert(toFormState)(stateValues),
      validationFn: (values: FormikValues) =>
        convertAndValidatePipeline(
          [
            { validator, conversionFn: convert(conversionSpec0) },
            { validator, conversionFn: convert(conversionSpec1) },
            {
              validator: transformValidator(validatorConversionSpec)(validator),
              conversionFn: conversion2,
            },
          ],
          values,
        ),
    })),
  )(WrappedComponent);

const toFormState = {
  useOfCapitalList: [
    convertInArray({ percent: [convertFractionToPercentage(), convertNumberToString()] }),
  ],
};

const fromFormState = {
  useOfCapitalList: [
    removeEmptyKeyValueFields(),
    convertInArray({ percent: [parseStringToFloat(), convertPercentageToFraction()] }),
  ],
};

export { connectEtoRegistrationPitch };
