import { createActionFactory } from "../actionsUtils";

export const etoNomineeActions = {

  setNomineeRequests:createActionFactory(
    "ETO_NOMINEE_SET_NOMINEE_REQUESTS",
    (requests) => ({requests})
  ),

};
