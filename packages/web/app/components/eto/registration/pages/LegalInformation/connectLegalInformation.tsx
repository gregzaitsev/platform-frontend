import { FormikValues } from "formik";
import * as React from "react";
import { compose, setDisplayName, withProps } from "recompose";

import { TPartialCompanyEtoData } from "../../../../../lib/api/eto/EtoApi.interfaces.unsafe";
import { actions } from "../../../../../modules/actions";
import { selectIssuerCompany } from "../../../../../modules/eto-flow/selectors";
import { EEtoFormTypes } from "../../../../../modules/eto-flow/types";
import { appConnect } from "../../../../../store";
import { convert } from "../../../utils";
import {
  fromFormState,
  legalInformationValidationFn,
  toFormState,
} from "./validateLelgalInformation";

type TStateProps = {
  loadingData: boolean;
  savingData: boolean;
  company: TPartialCompanyEtoData;
};

type TExternalProps = {
  readonly: boolean;
};

type TDispatchProps = {
  saveData: (values: TPartialCompanyEtoData) => void;
};

type TWithProps = {
  initialValues: TPartialCompanyEtoData;
  validationFn: (values: FormikValues) => void;
};

export type TComponentProps = TStateProps & TDispatchProps & TExternalProps & TWithProps;

const connectEtoRegistrationLegalInformation = (
  WrappedComponent: React.FunctionComponent<TComponentProps>,
) =>
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
      validationFn: (values: FormikValues) => legalInformationValidationFn(values),
    })),
  )(WrappedComponent);

export { connectEtoRegistrationLegalInformation };
