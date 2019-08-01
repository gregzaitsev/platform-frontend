import {  fork, put } from "redux-saga/effects";
import { delay } from "redux-saga";

import { TGlobalDependencies } from "../../di/setupBindings";
import { actions, TActionFromCreator } from "../actions";
import { neuCall, neuTakeLatest, neuTakeUntil } from "../sagasUtils";
import { TNomineeRequestResponse } from "../../lib/api/eto/EtoApi.interfaces.unsafe";
import { ENomineeUpdateRequestStatus, TNomineeRequestStorage } from "../nominee-flow/reducer";
import { etoApiDataToNomineeRequests } from "../nominee-flow/utils";
import { NOMINEE_REQUESTS_WATCHER_DELAY } from "../../config/constants";

export function* etoGetNomineeRequests({
  apiEtoNomineeService,
  logger,
}: TGlobalDependencies): Iterator<any> {
  try {
    const nomineeRequests:TNomineeRequestResponse[] = yield apiEtoNomineeService.etoGetNomineeRequest();
    const nomineeRequestsConverted: TNomineeRequestStorage = etoApiDataToNomineeRequests(nomineeRequests);

    yield put(actions.etoNominee.storeNomineeRequests(nomineeRequestsConverted));
  } catch (e) {
    logger.error("Failed to load Nominee requests", e);

    //fixme add error notification
  }
}

export function* etoNomineeRequestsWatcher({logger}: TGlobalDependencies): Iterator<any>{
  while (true) {
    logger.info("Getting nominee requests");
    try {
      yield neuCall(etoGetNomineeRequests);
    } catch (e) {
      logger.error("Error getting nominee requests", e);
    }

    yield delay(NOMINEE_REQUESTS_WATCHER_DELAY);
  }
}

export function* updateNomineeRequest({
  apiEtoNomineeService,
  logger,
}: TGlobalDependencies,
  action:  TActionFromCreator<typeof actions.etoNominee.acceptNomineeRequest> | TActionFromCreator<typeof actions.etoNominee.rejectNomineeRequest>): Iterator<any> {
  try {
    const newStatus = action.type === actions.etoNominee.acceptNomineeRequest.getType()
      ? ENomineeUpdateRequestStatus.APPROVED
      : ENomineeUpdateRequestStatus.REJECTED;

    yield apiEtoNomineeService.etoUpdateNomineeRequest(action.payload.nomineeId, newStatus);

  } catch (e) {
    logger.error("Failed to update nominee request", e);
  }
}

export function* etoNomineeSagas(): Iterator<any> {
  yield fork(neuTakeLatest, actions.etoNominee.getNomineeRequests, etoGetNomineeRequests);
  yield fork(neuTakeLatest, actions.etoNominee.acceptNomineeRequest, updateNomineeRequest);
  yield fork(neuTakeLatest, actions.etoNominee.rejectNomineeRequest, updateNomineeRequest);
  yield fork(neuTakeUntil, actions.etoNominee.startNomineeRequestsWatcher, actions.etoNominee.stopNomineeRequestsWatcher,etoNomineeRequestsWatcher)
}
