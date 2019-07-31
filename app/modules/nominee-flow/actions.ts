import { createActionFactory } from "../actionsUtils";
import { ENomineeRequestError, INomineeRequest } from "./reducer";

export const nomineeFlowActions = {
  loadNomineeTaskData:createActionFactory(
    "NOMINEE_FLOW_LOAD_NOMINEE_TASK_DATA",
  ),
  storeNomineeTaskData:createActionFactory(
    "NOMINEE_FLOW_SET_NOMINEE_TASKS_STATUS",
    (tasks) => ({tasks})
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
  ),
};
