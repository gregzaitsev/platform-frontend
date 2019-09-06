import { Effect, fork, put, select } from "redux-saga/effects";

import { hashFromIpfsLink } from "../../components/documents/utils";
import {
  AuthMessage,
  getMessageTranslation,
  ToSMessage,
} from "../../components/translatedMessages/messages";
import { createMessage } from "../../components/translatedMessages/utils";
import { EJwtPermissions } from "../../config/constants";
import { TGlobalDependencies } from "../../di/setupBindings";
import { IUser } from "../../lib/api/users/interfaces";
import { actions } from "../actions";
import { ensurePermissionsArePresentAndRunEffect } from "../auth/jwt/sagas";
import { selectCurrentAgreementHash } from "../auth/selectors";
import { waitUntilSmartContractsAreInitialized } from "../init/sagas";
import { neuCall, neuTakeEvery } from "../sagasUtils";

/**
 * Handle ToS / agreement
 */
export function* loadCurrentAgreement({
  contractsService,
  logger,
}: TGlobalDependencies): Iterator<any> {
  yield waitUntilSmartContractsAreInitialized();

  logger.info("Loading current agreement hash");

  try {
    const result = yield contractsService.universeContract.currentAgreement();
    let currentAgreementHash = result[2] as string;
    currentAgreementHash = hashFromIpfsLink(currentAgreementHash);
    yield put(actions.tosModal.setCurrentAgreementHash(currentAgreementHash));
  } catch (e) {
    logger.error("Could not load current agreement", e);
  }
}

function* handleAcceptCurrentAgreementEffect({ apiUserService }: TGlobalDependencies): any {
  const currentAgreementHash: string = yield select(selectCurrentAgreementHash);

  const user: IUser = yield apiUserService.setLatestAcceptedTos(currentAgreementHash);
  yield put(actions.auth.setUser(user));
}

function* handleAcceptCurrentAgreement({
  logger,
  notificationCenter,
}: TGlobalDependencies): Iterator<any> {
  try {
    yield neuCall(
      ensurePermissionsArePresentAndRunEffect,
      neuCall(handleAcceptCurrentAgreementEffect),
      [EJwtPermissions.SIGN_TOS],
      createMessage(ToSMessage.TOS_ACCEPT_PERMISSION_TITLE),
      createMessage(ToSMessage.TOS_ACCEPT_PERMISSION_TEXT),
    );
  } catch (e) {
    notificationCenter.error(createMessage(AuthMessage.AUTH_TOC_ACCEPT_ERROR));
    logger.error("Could not accept Terms and Conditions", e);
  }
}

function* handleDownloadCurrentAgreement(_: TGlobalDependencies): Iterator<any> {
  const currentAgreementHash: string = yield select(selectCurrentAgreementHash);
  const fileName = createMessage(AuthMessage.AUTH_TOC_FILENAME);
  yield put(
    actions.immutableStorage.downloadImmutableFile(
      {
        ipfsHash: currentAgreementHash,
        mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        asPdf: true,
      },
      getMessageTranslation(fileName) as string,
    ),
  );
}

export const termsOfServiceSagas = function*(): Iterator<Effect> {
  yield fork(neuTakeEvery, actions.auth.setUser, loadCurrentAgreement);
  yield fork(neuTakeEvery, "ACCEPT_CURRENT_AGREEMENT", handleAcceptCurrentAgreement);
  yield fork(neuTakeEvery, "DOWNLOAD_CURRENT_AGREEMENT", handleDownloadCurrentAgreement);
};
