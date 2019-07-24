import { TGlobalDependencies } from "../../di/setupBindings";
import { fork, put } from "redux-saga/effects";
import { actions, TActionFromCreator } from "../actions";
import { TNomineeRequestResponse } from "../../lib/api/users/interfaces";
import { ENomineeConnectRequestStatus } from "./reducer";
import { neuTakeLatest } from "../sagasUtils";


export function* loadNomineeTaskStatus({
  apiUserService,
  logger,
}: TGlobalDependencies): Iterator<any> {
  try {
    const taskStatus = yield apiUserService.getNomineeTasksStatus();
    // const eto: TEtoSpecsData = yield apiEtoService.getMyEto();
    //
    // if (eto.state === EEtoState.ON_CHAIN) {
    //   yield neuCall(loadEtoContract, eto);
    // }

    yield put(actions.nomineeFlow.setNomineeTaskStatus({ taskStatus }));
  } catch (e) {
    logger.error("Failed to load Nominee tasks", e);
    // notificationCenter.error(createMessage(EtoFlowMessage.ETO_LOAD_FAILED));
    // yield put(actions.routing.goToDashboard());
  }
}

const NomineeRequestResponseToRequestStatus = (response:TNomineeRequestResponse) => {
  switch (response.new_state) {
    case "pending":
      return ENomineeConnectRequestStatus.PENDING;
    case "approved":
      return ENomineeConnectRequestStatus.APPROVED;
    case "rejected":
      return ENomineeConnectRequestStatus.REJECTED;
    default:
      throw new Error("invalid response")
  }
};

export function* createNomineeRequest({
  apiUserService,
  logger,
}: TGlobalDependencies,
  action: TActionFromCreator<typeof actions.nomineeFlow.createNomineeRequest>,
): Iterator<any> {
  try {
    yield put(actions.nomineeFlow.startNomineeTasksRequest());


    const requestStatus:TNomineeRequestResponse =
      yield apiUserService.createNomineeRequest(action.payload.issuerId);
    const statusConverted:ENomineeConnectRequestStatus = NomineeRequestResponseToRequestStatus(requestStatus);

    yield put(actions.nomineeFlow.setNomineeRequestStatus(statusConverted));
  } catch (e) {
    logger.error("Failed to create nominee request", e);
    yield put(actions.nomineeFlow.setNomineeRequestStatus(ENomineeConnectRequestStatus.ERROR));
    yield put(actions.routing.goToDashboard());
  }
}

export function* nomineeFlowSagas(): Iterator<any> {
  yield fork(neuTakeLatest, actions.nomineeFlow.createNomineeRequest, createNomineeRequest);
}
