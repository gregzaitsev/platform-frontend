import { IAppState } from "../../store";
import { ENomineeRequestStatus } from "./reducer";

export const selectNomineeStateIsLoading = (state: IAppState) =>
  state.nomineeFlow.loading;

export const selectNomineeLinkRequestStatus = (state: IAppState):ENomineeRequestStatus =>
  state.nomineeFlow.nomineeRequestStatus;
