import {  fork, put } from "redux-saga/effects";

import { TGlobalDependencies } from "../../di/setupBindings";
import { actions } from "../actions";
import { neuTakeLatest } from "../sagasUtils";
import { TNomineeRequestResponse } from "../../lib/api/eto/EtoApi.interfaces.unsafe";
import { TNomineeRequestStorage } from "../nominee-flow/reducer";
import { apiDataToNomineeRequests } from "../nominee-flow/utils";

export function* etoGetNomineeRequests({
  apiEtoNomineeService,
  logger,
}: TGlobalDependencies): Iterator<any> {
  try {
    const nomineeRequests:TNomineeRequestResponse[] = yield apiEtoNomineeService.etoGetNomineeRequest();
    console.log("--->etoGetNomineeRequests: nomineeRequests", nomineeRequests)
    const nomineeRequestsConverted: TNomineeRequestStorage = apiDataToNomineeRequests(nomineeRequests);

    yield put(actions.etoNominee.storeNomineeRequests(nomineeRequestsConverted));
  } catch (e) {
    logger.error("Failed to load Nominee requests", e);

    //fixme add error notification
  }
}

export function* etoNomineeSagas(): Iterator<any> {
  yield fork(neuTakeLatest, actions.etoNominee.getNomineeRequests, etoGetNomineeRequests);
}
