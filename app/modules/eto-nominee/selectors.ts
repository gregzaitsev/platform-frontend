import { IAppState } from "../../store";

export const selectNomineeRequests = (state: IAppState) =>
  state.etoNominee.nomineeRequests;
