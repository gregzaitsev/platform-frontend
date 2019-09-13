import { createSelector } from "reselect";

import { TEtoSpecsData } from "../../lib/api/eto/EtoApi.interfaces.unsafe";
import { IEtoDocument } from "../../lib/api/eto/EtoFileApi.interfaces";
import { nomineeIgnoredTemplates } from "../../lib/api/eto/EtoFileUtils";
import { IAppState } from "../../store";
import { nonNullable } from "../../utils/nonNullable";
import { objectToFilteredArray } from "../../utils/objectToFilteredArray";
import { selectIsBankAccountVerified } from "../bank-transfer-flow/selectors";
import { selectEtoContract, selectEtoSubState } from "../eto/selectors";
import { TEtoWithCompanyAndContract } from "../eto/types";
import { selectRouter } from "../routing/selectors";
import { selectIsVerificationFullyDone } from "../selectors";
import {
  ENomineeAcceptAgreementStatus, ENomineeRedeemShareholderCapitalStatus, ENomineeUploadIshaStatus,
  TNomineeRequestStorage,
} from "./types";
import { getActiveEtoPreviewCodeFromQueryString, getNomineeTaskStep } from "./utils";

export const selectNomineeFlow = (state: IAppState) => state.nomineeFlow;

export const selectNomineeStateIsLoading = (state: IAppState) => state.nomineeFlow.loading;

export const selectNomineeStateError = (state: IAppState) => state.nomineeFlow.error;

export const selectNomineeRequests = (state: IAppState): TNomineeRequestStorage =>
  state.nomineeFlow.nomineeRequests;

export const selectLinkedNomineeEtoId = (state: IAppState): string | undefined => {
  const activeNomineeEto = selectActiveNomineeEto(state);
  return activeNomineeEto && activeNomineeEto.etoId
};

export const selectNomineeTHAState = (state: IAppState): ENomineeAcceptAgreementStatus =>
  state.nomineeFlow.acceptTha;

export const selectNomineeISHAState = (state: IAppState): ENomineeUploadIshaStatus =>
  state.nomineeFlow.uploadIsha

export const selectNomineeRAAAState = (state: IAppState): ENomineeAcceptAgreementStatus =>
  state.nomineeFlow.acceptRaaa;

export const selectRedeemShareCapitalState = (_:IAppState): ENomineeRedeemShareholderCapitalStatus =>
  ENomineeRedeemShareholderCapitalStatus.DONE;

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

export const selectNomineeTaskStep = createSelector(
  selectIsVerificationFullyDone,
  selectNomineeEtoWithCompanyAndContract,
  selectIsBankAccountVerified,
  selectNomineeTHAState,
  selectNomineeRAAAState,
  selectRedeemShareCapitalState,
  selectNomineeISHAState,
  (
    verificationIsComplete,
    nomineeEto,
    isBankAccountVerified,
    nomineeTHAStatus,
    nomineeRAAAStatus,
    selectRedeemShareCapitalState,
    selectNomineeISHAState,
  ) =>
    getNomineeTaskStep(
      verificationIsComplete,
      nomineeEto,
      isBankAccountVerified,
      nomineeTHAStatus,
      nomineeRAAAStatus,
      selectRedeemShareCapitalState,
      selectNomineeISHAState
    ),
);

export const selectActiveEtoPreviewCodeFromQueryString = createSelector(
  selectRouter,
  state => getActiveEtoPreviewCodeFromQueryString(state.location.search),
);

export const selectIshaHash = (state: IAppState):string | undefined =>
  state.nomineeFlow.ishaHash;

export const selectIshaLoading = (state:IAppState):boolean =>
  state.nomineeFlow.ishaUploading
