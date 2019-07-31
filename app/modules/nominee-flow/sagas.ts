import { TGlobalDependencies } from "../../di/setupBindings";
import { all, fork, put } from "redux-saga/effects";
import { actions, TActionFromCreator } from "../actions";
import {
  ENomineeAcceptThaStatus,
  ENomineeLinkBankAccountStatus, ENomineeRedeemShareholderCapitalStatus,
  ENomineeRequestError,
  ENomineeUploadIshaStatus,
  INomineeRequest,
  TNomineeRequestStorage
} from "./reducer";
import { neuTakeLatest } from "../sagasUtils";
import { createMessage } from "../../components/translatedMessages/utils";
import { ENomineeLinkErrorNotifications } from "../../components/translatedMessages/messages";
import { TNomineeRequestResponse } from "../../lib/api/eto/EtoApi.interfaces.unsafe";
import { IssuerIdInvalid, NomineeRequestExists } from "../../lib/api/eto/EtoNomineeApi";
import { apiDataToNomineeRequests, nomineeRequestResponseToRequestStatus } from "./utils";

export function* loadNomineeTaskData({
  apiEtoNomineeService,
  logger,
}: TGlobalDependencies): Iterator<any> {
  try {
    const taskData = yield all({
      nomineeRequests: apiEtoNomineeService.getNomineeLinkRequestStatus(),
      // todo query here if data not in the store yet
      // linkBankAccount:
      // acceptTha:
      // redeemShareholderCapital:
      // uploadIsha:
    });

    console.log("-->taskData.nomineeRequestStatus", taskData.nomineeRequests);

    const nomineeRequestsConverted: TNomineeRequestStorage = apiDataToNomineeRequests(taskData.nomineeRequests);
    // const linkBankAccountConverted = ...
    // const acceptThaConverted = ...
    // const redeemShareholderCapitalConverted = ...
    // const uploadIshaConverted = ...

    yield put(actions.nomineeFlow.storeNomineeTaskData({
      nomineeRequests:nomineeRequestsConverted,
      linkBankAccount:ENomineeLinkBankAccountStatus.NOT_DONE,
      acceptTha:ENomineeAcceptThaStatus.NOT_DONE,
      redeemShareholderCapital:ENomineeRedeemShareholderCapitalStatus.NOT_DONE,
      uploadIsha:ENomineeUploadIshaStatus.NOT_DONE,
    }));
  } catch (e) {
    logger.error("Failed to load Nominee tasks", e);

    //fixme add error notification
  }
}



export function* createNomineeLinkRequest({
    apiEtoNomineeService,
    logger,
    notificationCenter
  }: TGlobalDependencies,
  action: TActionFromCreator<typeof actions.nomineeFlow.createNomineeRequest>,
): Iterator<any> {
  try {
    const nomineeRequest: TNomineeRequestResponse =
      yield apiEtoNomineeService.createNomineeLinkRequest(action.payload.issuerId);
    const nomineeRequestConverted: INomineeRequest = nomineeRequestResponseToRequestStatus(nomineeRequest);

    yield put(actions.nomineeFlow.storeNomineeRequest(action.payload.issuerId,nomineeRequestConverted));

  } catch (e) {
    if (e instanceof IssuerIdInvalid) {
      logger.error("Failed to create nominee request, issuer id is invalid", e);
      yield put(actions.nomineeFlow.storeNomineeRequestError(action.payload.issuerId,ENomineeRequestError.ISSUER_ID_ERROR));
      notificationCenter.error(createMessage(ENomineeLinkErrorNotifications.ISSUER_ID_ERROR));
    } else if (e instanceof NomineeRequestExists) {
      logger.error(`Nominee request to issuerId ${action.payload.issuerId} already exists`, e);
      yield put(actions.nomineeFlow.storeNomineeRequestError(action.payload.issuerId,ENomineeRequestError.REQUEST_EXISTS));
      notificationCenter.error(createMessage(ENomineeLinkErrorNotifications.REQUEST_EXISTS));
    } else {
      logger.error("Failed to create nominee request", e);
      yield put(actions.nomineeFlow.storeNomineeRequestError(action.payload.issuerId,ENomineeRequestError.GENERIC_ERROR));
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
