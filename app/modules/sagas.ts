import { effects } from "redux-saga";
import { getContext } from "redux-saga/effects";

import { TGlobalDependencies } from "../di/setupBindings";
import { actions } from "./actions";
import { authSagas } from "./auth/sagas";
import { bankTransferFlowSaga } from "./bank-transfer-flow/sagas";
import { bookBuildingFlowSagas } from "./bookbuilding-flow/sagas";
import { etoDocumentsSagas } from "./eto-documents/sagas";
import { etoFlowSagas } from "./eto-flow/sagas";
import { etoSagas } from "./eto/sagas";
import { gasApiSagas } from "./gas/sagas";
import { icbmWalletGetDataSagas } from "./icbm-wallet-balance-modal/sagas";
import { immutableFileSagas } from "./immutable-file/sagas";
import { initSagas } from "./init/sagas";
import { investmentFlowSagas } from "./investment-flow/sagas";
import { investorTicketsSagas } from "./investor-portfolio/sagas";
import { kycSagas } from "./kyc/sagas";
import { notificationModalSagas } from "./notificationModal/sagas";
import { profileSagas } from "./profile/sagas";
import { routingSagas } from "./routing/sagas";
import { neuRestartIf } from "./sagasUtils";
import { formSingleFileUploadSagas } from "./shared/formSingleFileUpload/sagas";
import { remoteFileSagas } from "./shared/remoteFile/sagas";
import { tokenPriceSagas } from "./shared/tokenPrice/sagas";
import { termsOfServiceSagas } from "./terms-of-service-modal/sagas";
import { txHistorySaga } from "./tx-history/sagas";
import { txMonitorSagas } from "./tx/monitor/sagas";
import { txTransactionsSagasWatcher } from "./tx/transactions/sagas";
import { txValidatorSagasWatcher } from "./tx/validator/sagas";
import { browserWalletSagas } from "./wallet-selector/browser-wizard/sagas";
import { ledgerSagas } from "./wallet-selector/ledger-wizard/sagas";
import { lightWalletSagas } from "./wallet-selector/light-wizard/sagas";
import { walletSelectorSagas } from "./wallet-selector/sagas";
import { walletSagas } from "./wallet/sagas";
import { web3Sagas } from "./web3/sagas";
import { nomineeFlowSagas } from "./nominee-flow/sagas";
import { etoNomineeSagas } from "./eto-nominee/sagas";

/**
 * Restart all sagas on error and report error to sentry
 */
function* allSagas(): Iterator<effects.Effect> {
  yield effects.all([
    // Sagas that should keep running even after logout
    effects.fork(initSagas),
    effects.fork(authSagas),
    effects.fork(walletSelectorSagas),
    effects.fork(lightWalletSagas),
    effects.fork(browserWalletSagas),
    effects.fork(ledgerSagas),
    effects.fork(routingSagas),
    effects.fork(tokenPriceSagas),
    effects.fork(notificationModalSagas),
    // Sagas that should be restarted immediately when logout occurs
    effects.fork(neuRestartIf, actions.auth.logout, termsOfServiceSagas),
    effects.fork(neuRestartIf, actions.auth.logout, bankTransferFlowSaga),
    effects.fork(neuRestartIf, actions.auth.logout, kycSagas),
    effects.fork(neuRestartIf, actions.auth.logout, investorTicketsSagas),
    effects.fork(neuRestartIf, actions.auth.logout, profileSagas),
    effects.fork(neuRestartIf, actions.auth.logout, web3Sagas),
    effects.fork(neuRestartIf, actions.auth.logout, walletSagas),
    effects.fork(neuRestartIf, actions.auth.logout, icbmWalletGetDataSagas),
    effects.fork(neuRestartIf, actions.auth.logout, etoFlowSagas),
    effects.fork(neuRestartIf, actions.auth.logout, immutableFileSagas),
    effects.fork(neuRestartIf, actions.auth.logout, etoSagas),
    effects.fork(neuRestartIf, actions.auth.logout, etoNomineeSagas),
    effects.fork(neuRestartIf, actions.auth.logout, bookBuildingFlowSagas),
    effects.fork(neuRestartIf, actions.auth.logout, formSingleFileUploadSagas),
    effects.fork(neuRestartIf, actions.auth.logout, remoteFileSagas),
    effects.fork(neuRestartIf, actions.auth.logout, txValidatorSagasWatcher),
    effects.fork(neuRestartIf, actions.auth.logout, txTransactionsSagasWatcher),
    effects.fork(neuRestartIf, actions.auth.logout, gasApiSagas),
    effects.fork(neuRestartIf, actions.auth.logout, etoDocumentsSagas),
    effects.fork(neuRestartIf, actions.auth.logout, txMonitorSagas),
    effects.fork(neuRestartIf, actions.auth.logout, investmentFlowSagas),
    effects.fork(neuRestartIf, actions.auth.logout, txHistorySaga),
    effects.fork(neuRestartIf, actions.auth.logout, nomineeFlowSagas),
  ]);
}

function* handleRootError(error: Error): Iterator<effects.Effect> {
  const { logger }: TGlobalDependencies = yield getContext("deps");

  logger.error(error);
}

export function* rootSaga(): Iterator<effects.Effect> {
  while (true) {
    try {
      yield effects.call(allSagas);
    } catch (e) {
      yield effects.call(handleRootError, e);
    }
  }
}
