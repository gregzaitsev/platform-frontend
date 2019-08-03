import { delay } from "redux-saga";
import { all, fork, put } from "redux-saga/effects";

import {
  ENomineeRequestErrorNotifications
} from "../../components/translatedMessages/messages";
import { createMessage } from "../../components/translatedMessages/utils";
import { NOMINEE_REQUESTS_WATCHER_DELAY } from "../../config/constants";
import { TGlobalDependencies } from "../../di/setupBindings";
import { TNomineeRequestResponse } from "../../lib/api/eto/EtoApi.interfaces.unsafe";
import { IssuerIdInvalid, NomineeRequestExists } from "../../lib/api/eto/EtoNomineeApi";
import { actions, TActionFromCreator } from "../actions";
import { neuCall, neuTakeLatest, neuTakeUntil } from "../sagasUtils";
import {
  ENomineeAcceptThaStatus,
  ENomineeLinkBankAccountStatus,
  ENomineeRedeemShareholderCapitalStatus,
  ENomineeRequestError,
  ENomineeUploadIshaStatus,
  INomineeRequest,
  TNomineeRequestStorage,
} from "./reducer";
import { nomineeApiDataToNomineeRequests, nomineeRequestResponseToRequestStatus } from "./utils";

export function* loadNomineeTaskData({
  apiEtoNomineeService,
  logger,
  notificationCenter
}: TGlobalDependencies): Iterator<any> {
  try {
    const taskData = yield all({
      nomineeRequests: yield apiEtoNomineeService.getNomineeRequests(),
      // todo query here if data not in the store yet
      // linkBankAccount:
      // acceptTha:
      // redeemShareholderCapital:
      // uploadIsha:
    });

    const nomineeRequestsConverted: TNomineeRequestStorage = nomineeApiDataToNomineeRequests(
      taskData.nomineeRequests,
    );
    // todo convert data
    // const linkBankAccountConverted = ...
    // const acceptThaConverted = ...
    // const redeemShareholderCapitalConverted = ...
    // const uploadIshaConverted = ...

    yield put(
      actions.nomineeFlow.storeNomineeTaskData({
        nomineeRequests: nomineeRequestsConverted,
        linkBankAccount: ENomineeLinkBankAccountStatus.NOT_DONE,
        acceptTha: ENomineeAcceptThaStatus.NOT_DONE,
        redeemShareholderCapital: ENomineeRedeemShareholderCapitalStatus.NOT_DONE,
        uploadIsha: ENomineeUploadIshaStatus.NOT_DONE,
      }),
    );
  } catch (e) {
    logger.error("Failed to load Nominee tasks", e);
    notificationCenter.error(createMessage(ENomineeRequestErrorNotifications.FETCH_NOMINEE_DATA_ERROR));
    //show the user what's already loaded
    yield put(actions.nomineeFlow.dataReady())
  }
}

export function* loadNomineeRequests({
  apiEtoNomineeService,
  logger,
}: TGlobalDependencies): Iterator<any> {
  try {
    const nomineeRequests = yield apiEtoNomineeService.getNomineeRequests();
    const nomineeRequestsConverted: TNomineeRequestStorage = nomineeApiDataToNomineeRequests(
      nomineeRequests,
    );
    yield put(actions.nomineeFlow.storeNomineeRequests(nomineeRequestsConverted));
  } catch (e) {
    logger.error("Failed to load nominee requests", e);
  }
}

export function* nomineeRequestsWatcher({ logger }: TGlobalDependencies): Iterator<any> {
  while (true) {
    logger.info("Getting nominee requests");
    try {
      yield neuCall(loadNomineeRequests);
    } catch (e) {
      logger.error("Error getting nominee requests", e);
    }

    yield delay(NOMINEE_REQUESTS_WATCHER_DELAY);
  }
}

export function* createNomineeRequest(
  { apiEtoNomineeService, logger, notificationCenter }: TGlobalDependencies,
  action: TActionFromCreator<typeof actions.nomineeFlow.createNomineeRequest>,
): Iterator<any> {
  try {
    const nomineeRequest: TNomineeRequestResponse = yield apiEtoNomineeService.createNomineeRequest(
      action.payload.issuerId,
    );
    const nomineeRequestConverted: INomineeRequest = nomineeRequestResponseToRequestStatus(
      nomineeRequest,
    );

    yield put(
      actions.nomineeFlow.storeNomineeRequest(action.payload.issuerId, nomineeRequestConverted),
    );
  } catch (e) {
    if (e instanceof IssuerIdInvalid) {
      logger.error("Failed to create nominee request, issuer id is invalid", e);
      yield put(
        actions.nomineeFlow.storeNomineeRequestError(
          action.payload.issuerId,
          ENomineeRequestError.ISSUER_ID_ERROR,
        ),
      );
      notificationCenter.error(createMessage(ENomineeRequestErrorNotifications.ISSUER_ID_ERROR));
    } else if (e instanceof NomineeRequestExists) {
      logger.error(`Nominee request to issuerId ${action.payload.issuerId} already exists`, e);
      yield put(
        actions.nomineeFlow.storeNomineeRequestError(
          action.payload.issuerId,
          ENomineeRequestError.REQUEST_EXISTS,
        ),
      );
      notificationCenter.error(createMessage(ENomineeRequestErrorNotifications.REQUEST_EXISTS));
    } else {
      logger.error("Failed to create nominee request", e);
      yield put(
        actions.nomineeFlow.storeNomineeRequestError(
          action.payload.issuerId,
          ENomineeRequestError.GENERIC_ERROR,
        ),
      );
      notificationCenter.error(createMessage(ENomineeRequestErrorNotifications.SUBMITTING_ERROR));
    }
  } finally {
    yield put(actions.routing.goToDashboard());
    yield put(actions.nomineeFlow.dataReady())
  }
}

export function* nomineeFlowSagas(): Iterator<any> {
  yield fork(neuTakeLatest, actions.nomineeFlow.createNomineeRequest, createNomineeRequest);
  yield fork(neuTakeLatest, actions.nomineeFlow.loadNomineeTaskData, loadNomineeTaskData);
  yield fork(
    neuTakeUntil,
    actions.nomineeFlow.startNomineeRequestsWatcher,
    actions.nomineeFlow.stopNomineeRequestsWatcher,
    nomineeRequestsWatcher,
  );
}
