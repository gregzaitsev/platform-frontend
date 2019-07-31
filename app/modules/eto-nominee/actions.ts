import { createActionFactory } from "../actionsUtils";
import { TNomineeRequestStorage } from "../nominee-flow/reducer";

export const etoNomineeActions = {

  getNomineeRequests:createActionFactory(
    "ETO_NOMINEE_GET_NOMINEE_REQUESTS",
  ),
  storeNomineeRequests:createActionFactory(
    "ETO_NOMINEE_STORE_NOMINEE_REQUESTS",
    (requests:TNomineeRequestStorage) => ({requests})
  ),

};
