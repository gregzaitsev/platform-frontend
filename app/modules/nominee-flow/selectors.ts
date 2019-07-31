import { IAppState } from "../../store";
import { ENomineeRequestStatus, TNomineeRequestStorage } from "./reducer";

export const selectNomineeStateIsLoading = (state: IAppState) =>
  state.nomineeFlow.loading;

export const selectNomineeStateError = (state: IAppState) =>
  state.nomineeFlow.error;

export const selectNomineeRequests = (state: IAppState):TNomineeRequestStorage =>
  state.nomineeFlow.nomineeRequests;

export const selectLinkedNomineeEto = (state: IAppState):string | undefined =>
  state.nomineeFlow.nomineeRequests &&
  Object.keys(state.nomineeFlow.nomineeRequests).find(
    (requestId) =>state.nomineeFlow.nomineeRequests[requestId].state ===ENomineeRequestStatus.APPROVED
  );
