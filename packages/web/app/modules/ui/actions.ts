import { createActionFactory } from "@neufund/shared";
import { ERoute } from "./reducer";
import { EUiType } from "./sagas";

export const uiActions = {
  //TODO this goes to routing
  goToDashboard: createActionFactory("GO_TO_DASHBOARD"),
  goToProfile: createActionFactory("GO_TO_PROFILE"),
  goToWallet: createActionFactory("GO_TO_WALLET"),
  goTo: createActionFactory("GO_TO",
    (to:ERoute) => ({to})
    ),

  setUiData: createActionFactory(
    "SET_UI_DATA",
    (key:EUiType, data: any)=>({key,data})
  )
};
