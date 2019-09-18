import { compose } from "recompose";
import * as React from "react";
import { setDisplayName, withProps } from "recompose";
import * as Yup from "yup";

import { EEtoFormTypes } from "../../../../../modules/eto-flow/types";
import { appConnect } from "../../../../../store";
import { selectIssuerCompany } from "../../../../../modules/eto-flow/selectors";
import { TPartialCompanyEtoData } from "../../../../../lib/api/eto/EtoApi.interfaces.unsafe";
import {
  convert,
  convertInArray,
  convertNumberToString,
  parseStringToFloat,
  parseStringToInteger,
  removeEmptyKeyValueFields,
  setEmptyKeyValueFieldsUndefined
} from "../../../utils";
import { actions } from "../../../../../modules/actions";
import { currencyCodeSchema, dateSchema } from "../../../../../lib/api/util/customSchemas.unsafe";
import { MIN_COMPANY_SHARE_CAPITAL } from "../../../../../config/constants";
import { FormikValues } from "formik";
import { convertAndValidatePipeline } from "../../../../shared/forms/utils";

type TStateProps = {
  loadingData: boolean;
  savingData: boolean;
  company: TPartialCompanyEtoData;
}

type TExternalProps = {
  readonly: boolean;
}

type TDispatchProps = {
  saveData: (values: TPartialCompanyEtoData) => void;
}

type TWithProps = {
  initialValues: TPartialCompanyEtoData,
  validationFn: (values: FormikValues) => void
}

export type TComponentProps = TStateProps & TDispatchProps & TExternalProps & TWithProps

type TShareholdersListSchema = {
  fullName: string
  shareCapital: number
}

const ShareholdersListRequired = Yup.object().shape({
  fullName: Yup.string().required(),
  shareCapital: Yup.number().required()
});

const ShareholdersListNotRequired = Yup.object().shape({
  fullName: Yup.string().notRequired(),
  shareCapital: Yup.number().notRequired()
});

const ShareholdersListValidator = Yup.lazy((value: TShareholdersListSchema) => {
  if (value && (value['fullName'] !== undefined || value['shareCapital'] !== undefined)) {
    return ShareholdersListRequired as Yup.ObjectSchema<TShareholdersListSchema>;
  } else {
    return ShareholdersListNotRequired as Yup.ObjectSchema<TShareholdersListSchema>;
  }
});

const validator = Yup.object().shape({
  name: Yup.string().required(),
  legalForm: Yup.string().required(),
  companyLegalDescription: Yup.string().required(),
  street: Yup.string().required(),
  country: Yup.string().required(),
  vatNumber: Yup.string(),
  registrationNumber: Yup.string().required(),
  foundingDate: dateSchema(Yup.string()).required(),//todo write a normal method with Yup.addMethod
  numberOfEmployees: Yup.string(),
  companyStage: Yup.string(),
  numberOfFounders: Yup.number(),
  lastFundingSizeEur: Yup.number(),
  companyShareCapital: Yup.number().min(MIN_COMPANY_SHARE_CAPITAL).required(),
  shareCapitalCurrencyCode: currencyCodeSchema(Yup.string()),//todo write a normal extension method with Yup.addMethod
  shareholders: Yup.array().of(ShareholdersListValidator).min(1, "please fill out at least one entry").required("please fill out at least one entry"),
});

const conversionSpec0 = {
  shareholders: [
    setEmptyKeyValueFieldsUndefined(),
    convertInArray({shareCapital:parseStringToFloat({passThroughInvalidData:true})})
  ]
};

const conversionSpec1 = {
  shareholders: [
    removeEmptyKeyValueFields(),
    convertInArray({shareCapital:parseStringToFloat({passThroughInvalidData:true})})
  ]
};

const connectEtoRegistrationLegalInformation = (WrappedComponent: React.FunctionComponent<TComponentProps>) =>
  compose<TComponentProps, TExternalProps>(
    setDisplayName(EEtoFormTypes.LegalInformation),
    appConnect<TStateProps, TDispatchProps>({
      stateToProps: state => ({
        loadingData: state.etoIssuer.loading,
        savingData: state.etoIssuer.saving,
        company: selectIssuerCompany(state) as TPartialCompanyEtoData,
      }),
      dispatchToProps: dispatch => ({
        saveData: (company: TPartialCompanyEtoData) => {
          const convertedCompany = convert(fromFormState)(company);
          dispatch(actions.etoFlow.saveCompanyStart(convertedCompany));
        },
      }),
    }),
    withProps<TWithProps, TStateProps & TDispatchProps & TExternalProps>(({ company }) => ({
      initialValues: convert(toFormState)(company),
      validationFn: (values: FormikValues) => convertAndValidatePipeline([
        { validator, conversionFn: convert(conversionSpec0) },
        { validator, conversionFn: convert(conversionSpec1) },
      ], values)
    })),
  )(WrappedComponent);

const toFormState = {
  useOfCapitalList: [convertInArray({ shareCapital: convertNumberToString() })],

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

export { connectEtoRegistrationLegalInformation }
