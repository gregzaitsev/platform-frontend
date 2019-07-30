import { createActionFactory } from "../actionsUtils";
import { ENomineeRequestStatus } from "./reducer";

export const nomineeFlowActions = {
  loadNomineeTaskData:createActionFactory(
    "NOMINEE_FLOW_LOAD_NOMINEE_TASK_DATA",
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
    "NOMINEE_FLOW_SET_NOMINEE_LINK_REQUEST_STATUS",
    (requestStatus:ENomineeRequestStatus) => ({requestStatus})
  ),

};
