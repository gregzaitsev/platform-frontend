import { createActionFactory } from "@neufund/shared";
import { ERoute } from "./reducer";

export const uiActions = {
  goToDashboard: createActionFactory("GO_TO_DASHBOARD"),
  goToProfile: createActionFactory("GO_TO_PROFILE"),
  goToWallet: createActionFactory("GO_TO_WALLET"),
  goTo: createActionFactory("GO_TO",
    (to:ERoute) => ({to})
    ),
}
