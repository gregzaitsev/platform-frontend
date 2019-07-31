import { IAppState } from "../../store";
import { TNomineeRequestStorage } from "./reducer";

export const selectNomineeStateIsLoading = (state: IAppState) =>
  state.nomineeFlow.loading;

export const selectNomineeStateError = (state: IAppState) =>
  state.nomineeFlow.error;

export const selectNomineeRequests = (state: IAppState):TNomineeRequestStorage =>
  state.nomineeFlow.nomineeRequests;
