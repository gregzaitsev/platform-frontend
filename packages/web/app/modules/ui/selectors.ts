import { IAppState } from "../../store";
import { EUiType } from "./sagas";

export const selectAppUiState = (state: IAppState) =>
  state.ui.app

export const selectRoute = (state: IAppState) =>
  state.ui.route

export const selectUiData = <T>(state:IAppState, name: EUiType):T => {
  console.log("selectUiData:",name, state.ui[name])
  return state.ui[name]

}
