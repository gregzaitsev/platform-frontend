import {  fork, put } from "redux-saga/effects";

import { TGlobalDependencies } from "../../di/setupBindings";
import { actions, TActionFromCreator } from "../actions";
import { neuTakeLatest } from "../sagasUtils";
import { TNomineeRequestResponse } from "../../lib/api/eto/EtoApi.interfaces.unsafe";
import { ENomineeUpdateRequestStatus, TNomineeRequestStorage } from "../nominee-flow/reducer";
import { apiDataToNomineeRequests } from "../nominee-flow/utils";

export function* etoGetNomineeRequests({
  apiEtoNomineeService,
  logger,
}: TGlobalDependencies): Iterator<any> {
  try {
    const nomineeRequests:TNomineeRequestResponse[] = yield apiEtoNomineeService.etoGetNomineeRequest();
    const nomineeRequestsConverted: TNomineeRequestStorage = apiDataToNomineeRequests(nomineeRequests);

    yield put(actions.etoNominee.storeNomineeRequests(nomineeRequestsConverted));
  } catch (e) {
    logger.error("Failed to load Nominee requests", e);

    //fixme add error notification
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
}
