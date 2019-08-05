import { delay } from "redux-saga";
import { fork, put, select } from "redux-saga/effects";

import { EEtoNomineeRequestNotifications } from "../../components/translatedMessages/messages";
import { createMessage } from "../../components/translatedMessages/utils";
import { NOMINEE_REQUESTS_WATCHER_DELAY } from "../../config/constants";
import { TGlobalDependencies } from "../../di/setupBindings";
import { TNomineeRequestResponse } from "../../lib/api/eto/EtoApi.interfaces.unsafe";
import { actions, TActionFromCreator } from "../actions";
import { ENomineeUpdateRequestStatus, TNomineeRequestStorage } from "../nominee-flow/reducer";
import { etoApiDataToNomineeRequests } from "../nominee-flow/utils";
import { neuCall, neuTakeLatest, neuTakeUntil } from "../sagasUtils";
import { selectEtoNominee } from "../eto-flow/selectors";

export function* etoGetNomineeRequests({
  apiEtoNomineeService,
  logger,
  notificationCenter,
}: TGlobalDependencies): Iterator<any> {
  try {
    const nomineeRequests: TNomineeRequestResponse[] = yield apiEtoNomineeService.etoGetNomineeRequest();
    const nomineeRequestsConverted: TNomineeRequestStorage = etoApiDataToNomineeRequests(
      nomineeRequests,
    );

    yield put(actions.etoNominee.storeNomineeRequests(nomineeRequestsConverted));
  } catch (e) {
    logger.error("Failed to load Nominee requests", e);
    notificationCenter.error(createMessage(EEtoNomineeRequestNotifications.GENERIC_ERROR));
    yield put(actions.etoNominee.dataReady());
  }
}

export function* etoNomineeRequestsWatcher({ logger }: TGlobalDependencies): Iterator<any> {
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

export function* updateNomineeRequest(
  { apiEtoNomineeService, logger, notificationCenter }: TGlobalDependencies,
  action:
    | TActionFromCreator<typeof actions.etoNominee.acceptNomineeRequest>
    | TActionFromCreator<typeof actions.etoNominee.rejectNomineeRequest>,
): Iterator<any> {
  try {
    const newStatus =
      action.type === actions.etoNominee.acceptNomineeRequest.getType()
        ? ENomineeUpdateRequestStatus.APPROVED
        : ENomineeUpdateRequestStatus.REJECTED;

    yield apiEtoNomineeService.etoUpdateNomineeRequest(action.payload.nomineeId, newStatus);

    if (newStatus === ENomineeUpdateRequestStatus.APPROVED) {
      yield put(actions.etoFlow.loadIssuerEto());
      yield put(actions.etoNominee.dataReady());
    } else {
      yield put(actions.etoNominee.getNomineeRequests());
    }
  } catch (e) {
    logger.error("Failed to update nominee request", e);
    notificationCenter.error(createMessage(EEtoNomineeRequestNotifications.GENERIC_ERROR));
    yield put(actions.etoNominee.dataReady());
  }
}

export function* etoDeleteNomineeRequest(
  { apiEtoNomineeService, logger, notificationCenter }: TGlobalDependencies,
) {
  const nomineeId = yield select(selectEtoNominee);

  try{
    yield apiEtoNomineeService.etoDeleteNomineeRequest(nomineeId);
    yield put(actions.etoFlow.loadIssuerEto());
    notificationCenter.info(createMessage(EEtoNomineeRequestNotifications.DELETE_NOMINEE_REQUEST_SUCCESS));
  } catch (e){
    logger.error(`Error while trying to delete nominee request with nominee id ${nomineeId}`);
  } finally {
    yield put(actions.etoNominee.dataReady());
  }
}

export function* etoNomineeSagas(): Iterator<any> {
  yield fork(neuTakeLatest, actions.etoNominee.getNomineeRequests, etoGetNomineeRequests);
  yield fork(neuTakeLatest, actions.etoNominee.acceptNomineeRequest, updateNomineeRequest);
  yield fork(neuTakeLatest, actions.etoNominee.rejectNomineeRequest, updateNomineeRequest);
  yield fork(
    neuTakeUntil,
    actions.etoNominee.startNomineeRequestsWatcher,
    actions.etoNominee.stopNomineeRequestsWatcher,
    etoNomineeRequestsWatcher,
  );
  yield fork(neuTakeLatest, actions.etoNominee.deleteNomineeRequest, etoDeleteNomineeRequest);
}
