import { TGlobalDependencies } from "../../di/setupBindings";
import { EEtoState, TCompanyEtoData, TEtoSpecsData } from "../../lib/api/eto/EtoApi.interfaces.unsafe";
import { neuCall } from "../sagasUtils";
import { loadEtoContract } from "../eto/sagas";
import { put } from "redux-saga/effects";
import { actions } from "../actions";
import { createMessage } from "../../components/translatedMessages/utils";
import { EtoFlowMessage } from "../../components/translatedMessages/messages";

export function* loadNomineeTaskStatus({
  apiUserService,
  notificationCenter,
  logger,
}: TGlobalDependencies): Iterator<any> {
  try {
    const taskStatus = yield apiUserService.getNomineeTaskStatus();
    // const eto: TEtoSpecsData = yield apiEtoService.getMyEto();
    //
    // if (eto.state === EEtoState.ON_CHAIN) {
    //   yield neuCall(loadEtoContract, eto);
    // }

    yield put(actions.nomineeFlow.setNomineeTasks({ taskStatus }));
  } catch (e) {
    logger.error("Failed to load Nominee tasks", e);
    // notificationCenter.error(createMessage(EtoFlowMessage.ETO_LOAD_FAILED));
    // yield put(actions.routing.goToDashboard());
  }
}
