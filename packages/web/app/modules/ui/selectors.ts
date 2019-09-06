import { IAppState } from "../../store";

export const selectAppUiState = (state: IAppState) =>
  state.ui.app

export const selectRoute = (state: IAppState) =>
  state.ui.route
