export enum ENomineeRequestComponentState {
  SUCCESS = "nomineeRequestSuccess",
  WAIT_WHILE_RQUEST_PENDING = "waitWhileNomineeRequestPending",
  REPEAT_REQUEST = "repeatNomineeRequest",
  CREATE_REQUEST = "createNomineeRequest",
  CREATE_NEW_REQUEST = "createNewRequest", //this is the same as CREATE_REQUEST but with an additional error message in the ui
}
