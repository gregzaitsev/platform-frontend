import { createActionFactory } from "../actionsUtils";
import { ENomineeRequestError, INomineeRequest, TNomineeRequestStorage } from "./reducer";

export const nomineeFlowActions = {
  loadNomineeTaskData:createActionFactory(
    "NOMINEE_FLOW_LOAD_NOMINEE_TASK_DATA",
  ),
  storeNomineeTaskData:createActionFactory(
    "NOMINEE_FLOW_SET_NOMINEE_TASKS_STATUS",
    (tasks) => ({tasks})
  ),
  storeNomineeRequests:createActionFactory(
    "NOMINEE_FLOW_SET_NOMINEE_REQUESTS",
    (nomineeRequests:TNomineeRequestStorage) => ({nomineeRequests})
  ),
  startNomineeRequestsWatcher:createActionFactory(
    "NOMINEE_FLOW_START_NOMINEE_REQUESTS_WATCHER",
  ),
  stopNomineeRequestsWatcher:createActionFactory(
    "NOMINEE_FLOW_STOP_NOMINEE_REQUESTS_WATCHER",
  ),
  createNomineeRequest:createActionFactory(
  "NOMINEE_FLOW_CREATE_NOMINEE_REQUEST",
  (issuerId:string) => ({issuerId})
),
  storeNomineeRequest:createActionFactory(
    "NOMINEE_FLOW_SET_NOMINEE_LINK_REQUEST",
    (etoId:string,nomineeRequest:INomineeRequest) => ({etoId,nomineeRequest})
  ),
  storeNomineeRequestError:createActionFactory(
    "NOMINEE_FLOW_SET_NOMINEE_LINK_REQUEST_ERROR",
    (etoId:string,requestError:ENomineeRequestError) => ({etoId,requestError})
  )
};
