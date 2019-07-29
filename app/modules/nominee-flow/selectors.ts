import { IAppState } from "../../store";
import { ENomineeLinkRequestStatus } from "./reducer";

export const selectIsLoading = (state: IAppState) =>
  state.nomineeFlow.loading;

export const selectNomineeLinkRequestStatus = (state: IAppState):ENomineeLinkRequestStatus =>
  state.nomineeFlow.nomineeLinkRequestStatus;
