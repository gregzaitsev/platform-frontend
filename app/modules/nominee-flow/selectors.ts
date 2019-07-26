import { IAppState } from "../../store";

export const selectIsLoading = (state: IAppState) =>
  state.nomineeFlow.loading;
