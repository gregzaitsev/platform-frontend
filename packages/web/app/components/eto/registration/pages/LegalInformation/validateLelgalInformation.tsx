import * as React from "react";
import { FormattedMessage } from "react-intl-phraseapp";
import * as Yup from "yup";

import { MIN_COMPANY_SHARE_CAPITAL } from "../../../../../config/constants";
import { currencyCodeSchema, dateSchema } from "../../../../../lib/api/util/customSchemas.unsafe";
import { convertAndValidatePipeline } from "../../../../shared/forms/utils";
import {
  convert,
  convertInArray,
  convertNumberToString,
  parseStringToFloat,
  parseStringToInteger,
  removeEmptyKeyValueFields,
  setEmptyKeyValueFieldsUndefined,
} from "../../../utils";

type TShareholdersListSchema = {
  fullName: string;
  shareCapital: number;
};

export const toFormState = {
  useOfCapitalList: [convertInArray({ shareCapital: convertNumberToString() })],

  companyShareCapital: convertNumberToString(),
  numberOfFounders: convertNumberToString(),
  lastFundingSizeEur: convertNumberToString(),
};

export const fromFormState = {
  shareholders: [
    removeEmptyKeyValueFields(),
    convertInArray({ shareCapital: parseStringToInteger() }),
  ],
  companyShareCapital: parseStringToInteger(),
  lastFundingSizeEur: parseStringToFloat(),
  numberOfFounders: parseStringToInteger(),
};

const ShareholdersListRequired = Yup.object().shape({
  fullName: Yup.string().required(),
  shareCapital: Yup.number().required(),
});

const ShareholdersListNotRequired = Yup.object().shape({
  fullName: Yup.string().notRequired(),
  shareCapital: Yup.number().notRequired(),
});

const ShareholdersListValidator = Yup.lazy((value: TShareholdersListSchema) => {
  if (value && (value["fullName"] !== undefined || value["shareCapital"] !== undefined)) {
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
  foundingDate: dateSchema(Yup.string()).required(), //todo write a normal method with Yup.addMethod
  numberOfEmployees: Yup.string(),
  companyStage: Yup.string(),
  numberOfFounders: Yup.number(),
  lastFundingSizeEur: Yup.number(),
  companyShareCapital: Yup.number()
    .min(MIN_COMPANY_SHARE_CAPITAL)
    .required(),
  shareCapitalCurrencyCode: currencyCodeSchema(Yup.string()), //todo write an extension method with Yup.addMethod
  shareholders: Yup.array()
    .of(ShareholdersListValidator)
    .min(1, <FormattedMessage id="form.field.error.array.at-least-one-entry-required" />)
    .required(<FormattedMessage id="form.field.error.array.at-least-one-entry-required" />),
});

const conversionSpec0 = {
  ...fromFormState,
  shareholders: [
    setEmptyKeyValueFieldsUndefined(),
    convertInArray({ shareCapital: parseStringToFloat({ passThroughInvalidData: true }) }),
  ],
};

const conversionSpec1 = {
  ...fromFormState,
  shareholders: [
    removeEmptyKeyValueFields(),
    convertInArray({ shareCapital: parseStringToFloat({ passThroughInvalidData: true }) }),
  ],
};

export const legalInformationValidationFn = convertAndValidatePipeline([
  { validator, conversionFn: convert(conversionSpec0) },
  { validator, conversionFn: convert(conversionSpec1) },
]);
