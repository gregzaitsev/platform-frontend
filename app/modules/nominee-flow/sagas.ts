import { TGlobalDependencies } from "../../di/setupBindings";
import { all, fork, put } from "redux-saga/effects";
import { actions, TActionFromCreator } from "../actions";
import { ENomineeRequestStatus } from "./reducer";
import { neuTakeLatest } from "../sagasUtils";
import { createMessage } from "../../components/translatedMessages/utils";
import { ENomineeLinkErrorNotifications } from "../../components/translatedMessages/messages";
import { TNomineeRequestResponse } from "../../lib/api/eto/EtoApi.interfaces.unsafe";
import { IssuerIdInvalid, NomineeRequestExists } from "../../lib/api/eto/EtoNomineeApi";
import { takeLatestNomineeRequest } from "./utils";


export function* loadNomineeTaskData({
  apiEtoNomineeService,
  logger,
}: TGlobalDependencies): Iterator<any> {
  try {
    const taskData = yield all({
      nomineeRequestStatus: apiEtoNomineeService.getNomineeLinkRequestStatus(),
    })
    console.log("-->taskData.nomineeRequestStatus", taskData.nomineeRequestStatus)
    //only take the latest one for now
    const nomineeRequestStatusConverted = takeLatestNomineeRequest(taskData.nomineeRequestStatus);
    const etoId = nomineeRequestStatusConverted.etoId

    // todo move takeLatestNomineeRequest to component
    //  rewrite reducer to store ALL requests under etoIds,
    //  task state == empty/nonempty object
    yield put(actions.nomineeFlow.setNomineeRequestStatus(NomineeRequestResponseToRequestStatus(taskData.nomineeRequestStatus[0])));
  } catch (e) {
    logger.error("Failed to load Nominee tasks", e);
    // notificationCenter.error(createMessage(EtoFlowMessage.ETO_LOAD_FAILED));
    // yield put(actions.routing.goToDashboard());
  }
}

const NomineeRequestResponseToRequestStatus = (response: TNomineeRequestResponse) => {
  switch (response.state) {
    case "pending":
      return ENomineeRequestStatus.PENDING;
    case "approved":
      return ENomineeRequestStatus.APPROVED;
    case "rejected":
      return ENomineeRequestStatus.REJECTED;
    default:
      throw new Error("invalid response")
  }
};

export function* createNomineeLinkRequest({
    apiEtoNomineeService,
    logger,
    notificationCenter
  }: TGlobalDependencies,
  action: TActionFromCreator<typeof actions.nomineeFlow.createNomineeRequest>,
): Iterator<any> {
  try {
    // yield put(actions.nomineeFlow.startNomineeTasksRequest());


    const requestStatus: TNomineeRequestResponse =
      yield apiEtoNomineeService.createNomineeLinkRequest(action.payload.issuerId);
    const statusConverted: ENomineeRequestStatus = NomineeRequestResponseToRequestStatus(requestStatus);

    yield put(actions.nomineeFlow.setNomineeRequestStatus(statusConverted));
  } catch (e) {
    if (e instanceof IssuerIdInvalid) {
      logger.error("Failed to create nominee request, issuer id is invalid", e);
      yield put(actions.nomineeFlow.setNomineeRequestStatus(ENomineeRequestStatus.ISSUER_ID_ERROR));
      notificationCenter.error(createMessage(ENomineeLinkErrorNotifications.ISSUER_ID_ERROR));
    } else if (e instanceof NomineeRequestExists) {
      logger.error(`Nominee request to issuerId ${action.payload.issuerId} already exists`, e);
      yield put(actions.nomineeFlow.setNomineeRequestStatus(ENomineeRequestStatus.REQUEST_EXISTS));
      notificationCenter.error(createMessage(ENomineeLinkErrorNotifications.REQUEST_EXISTS));
    } else {
      logger.error("Failed to create nominee request", e);
      yield put(actions.nomineeFlow.setNomineeRequestStatus(ENomineeRequestStatus.GENERIC_ERROR));
      notificationCenter.error(createMessage(ENomineeLinkErrorNotifications.GENERIC_ERROR));
    }
  } finally {
    yield put(actions.routing.goToDashboard());
  }
}

export function* nomineeFlowSagas(): Iterator<any> {
  yield fork(neuTakeLatest, actions.nomineeFlow.createNomineeRequest, createNomineeLinkRequest);
  yield fork(neuTakeLatest, actions.nomineeFlow.loadNomineeTaskData, loadNomineeTaskData);
}
