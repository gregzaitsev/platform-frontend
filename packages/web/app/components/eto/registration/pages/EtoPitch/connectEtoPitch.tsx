import { FormikValues } from "formik";
import * as React from "react";
import { compose, setDisplayName, withProps } from "recompose";

import { TPartialCompanyEtoData } from "../../../../../lib/api/eto/EtoApi.interfaces.unsafe";
import { actions } from "../../../../../modules/actions";
import {
  selectIssuerCompany,
  selectIssuerEtoLoading,
  selectIssuerEtoSaving,
} from "../../../../../modules/eto-flow/selectors";
import { EEtoFormTypes } from "../../../../../modules/eto-flow/types";
import { appConnect } from "../../../../../store";
import {
  convert,
  convertFractionToPercentage,
  convertInArray,
  convertNumberToString,
  convertPercentageToFraction,
  parseStringToFloat,
  removeEmptyKeyValueFields,
} from "../../../utils";
import { etoPitchValidationFn } from "./validateEtoPitch";

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
      validationFn: (values: FormikValues) => etoPitchValidationFn(values),
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
