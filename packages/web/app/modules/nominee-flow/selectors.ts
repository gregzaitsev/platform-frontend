import { createSelector } from "reselect";

import { TEtoSpecsData } from "../../lib/api/eto/EtoApi.interfaces.unsafe";
import { IEtoDocument } from "../../lib/api/eto/EtoFileApi.interfaces";
import { nomineeIgnoredTemplates } from "../../lib/api/eto/EtoFileUtils";
import { IAppState } from "../../store";
import { nonNullable } from "../../utils/nonNullable";
import { objectToFilteredArray } from "../../utils/objectToFilteredArray";
import { selectIsBankAccountVerified } from "../bank-transfer-flow/selectors";
import { selectDocumentsStatus, selectEtoContract, selectEtoSubState } from "../eto/selectors";
import { TEtoWithCompanyAndContract, TOfferingDocuments } from "../eto/types";
import { selectRouter } from "../routing/selectors";
import { selectIsVerificationFullyDone } from "../selectors";
import { ENomineeRequestStatus, TNomineeRequestStorage } from "./types";
import { getActiveEtoPreviewCodeFromQueryString, getNomineeTaskStep } from "./utils";

export const selectNomineeFlow = (state: IAppState) => state.nomineeFlow;

export const selectNomineeStateIsLoading = (state: IAppState) => state.nomineeFlow.loading;

export const selectNomineeStateError = (state: IAppState) => state.nomineeFlow.error;

export const selectNomineeRequests = (state: IAppState): TNomineeRequestStorage =>
  state.nomineeFlow.nomineeRequests;

export const selectLinkedNomineeEtoId = (state: IAppState): string | undefined =>
  state.nomineeFlow.nomineeRequests &&
  Object.keys(state.nomineeFlow.nomineeRequests).find(
    requestId =>
      state.nomineeFlow.nomineeRequests[requestId].state === ENomineeRequestStatus.APPROVED,
  );

export const selectNomineeEtos = (
  state: IAppState,
): { [previewCode: string]: TEtoSpecsData | undefined } => state.nomineeFlow.nomineeEtos;

export const selectNomineeActiveEtoPreviewCode = (state: IAppState) =>
  state.nomineeFlow.activeNomineeEtoPreviewCode;

export const selectActiveNomineeEto = createSelector(
  selectNomineeEtos,
  selectNomineeActiveEtoPreviewCode,
  (etos, etoPreviewCode) => {
    if (etoPreviewCode) {
      return etos[etoPreviewCode];
    }

    return undefined;
  },
);

export const selectActiveNomineeEtoCompany = createSelector(
  selectActiveNomineeEto,
  selectNomineeFlow,
  (activeEto, nomineeFlow) =>
    activeEto ? nomineeFlow.nomineeEtosCompanies[activeEto.companyId] : undefined,
);

const selectNomineeEtoWithCompanyAndContractInternal = createSelector(
  // forward eto param to combiner
  (_: IAppState, eto: TEtoSpecsData) => eto,
  (state: IAppState, eto: TEtoSpecsData) => selectEtoContract(state, eto.previewCode),
  (state: IAppState) => nonNullable(selectActiveNomineeEtoCompany(state)),
  (state: IAppState, eto: TEtoSpecsData) => selectEtoSubState(state, eto),
  (eto, contract, company, subState) => ({
    ...eto,
    contract,
    company,
    subState,
  }),
);

export const selectNomineeEtoWithCompanyAndContract = (
  state: IAppState,
): TEtoWithCompanyAndContract | undefined => {
  const eto = selectActiveNomineeEto(state);

  if (eto) {
    return selectNomineeEtoWithCompanyAndContractInternal(state, eto);
  }

  return undefined;
};

export const selectNomineeEtoState = (state: IAppState) => {
  const eto = selectNomineeEtoWithCompanyAndContract(state);
  return eto ? eto.state : undefined;
};

export const selectNomineeEtoTemplatesArray = (state: IAppState): IEtoDocument[] => {
  const eto = selectNomineeEtoWithCompanyAndContract(state);
  const filterFunction = (key: string) =>
    !nomineeIgnoredTemplates.some((templateKey: string) => templateKey === key);

  return eto !== undefined ? objectToFilteredArray(filterFunction, eto.templates) : [];
};

export const selectNomineeEtoDocumentsStatus = (
  state: IAppState,
): TOfferingDocuments | undefined => {
  const eto = selectNomineeEtoWithCompanyAndContract(state);

  if (eto !== undefined) {
    return selectDocumentsStatus(state, eto.previewCode);
  }

  return undefined;
};

export const selectNomineeTaskStep = createSelector(
  selectIsVerificationFullyDone,
  selectNomineeEtoWithCompanyAndContract,
  selectIsBankAccountVerified,
  selectNomineeEtoDocumentsStatus,
  (verificationIsComplete, nomineeEto, isBankAccountVerified, documentsStatus) => {
    if (documentsStatus !== undefined) {
      return getNomineeTaskStep(
        verificationIsComplete,
        nomineeEto,
        isBankAccountVerified,
        documentsStatus,
      );
    }

    return undefined;
  },
);

export const selectActiveEtoPreviewCodeFromQueryString = createSelector(
  selectRouter,
  state => getActiveEtoPreviewCodeFromQueryString(state.location.search),
);
