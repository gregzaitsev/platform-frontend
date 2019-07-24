import { createActionFactory } from "../actionsUtils";
import { ENomineeConnectRequestStatus } from "./reducer";

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
  setNomineeRequestStatus:createActionFactory(
    "NOMINEE_FLOW_SET_NOMINEE_REQUEST_STATUS",
    (requestStatus:ENomineeConnectRequestStatus) => ({requestStatus})
  ),

};
