import { createActionFactory } from "../actionsUtils";
import { ENomineeLinkRequestStatus } from "./reducer";

export const nomineeFlowActions = {
  startNomineeTasksRequest:createActionFactory(
    "NOMINEE_FLOW_START_NOMINEE_TASKS_REQUEST",
  ),
  setNomineeTaskStatus:createActionFactory(
    "NOMINEE_FLOW_SET_NOMINEE_TASKS_STATUS",
    (tasks) => ({tasks})
  ),
  createNomineeRequest:createActionFactory(
  "NOMINEE_FLOW_CREATE_NOMINEE_REQUEST",
  (issuerId:string) => ({issuerId})
),
  setNomineeLinkRequestStatus:createActionFactory(
    "NOMINEE_FLOW_SET_NOMINEE_LINK_REQUEST_STATUS",
    (requestStatus:ENomineeLinkRequestStatus) => ({requestStatus})
  ),

};
