import { createActionFactory } from "../actionsUtils";

export const nomineeFlowActions = {
  startNomineeTaskRequest:createActionFactory(
    "NOMINEE_FLOW_START_NOMINEE_TASK_REQUEST",
  ),
  setNomineeTaskStatus:createActionFactory(
    "NOMINEE_FLOW_SET_NOMINEE_TASK_STATUS",
    (tasks) => ({tasks})
  ),
};
