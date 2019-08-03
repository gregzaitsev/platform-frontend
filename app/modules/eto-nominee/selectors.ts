import { IAppState } from "../../store";

export const selectNomineeRequests = (state: IAppState) => state.etoNominee.nomineeRequests;

export const selectEtoNomineeIsLoading = (state: IAppState): boolean => state.etoNominee.isLoading;
