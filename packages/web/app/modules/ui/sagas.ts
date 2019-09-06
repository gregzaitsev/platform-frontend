import { neuCall, neuFork, neuTakeEvery } from "../sagasUtils";
import { all, call, cancel, fork, put, select, takeLatest } from "redux-saga/effects";
import { actions } from "../actions";
import { waitForAppInit, waitForContractsInit } from "../init/sagas";
import { ERoute } from "./reducer";
import { selectRoute } from "./selectors";
import {
  selectIsMessageSigning,
  selectOppositeRootPath,
  selectUrlUserType
} from "../wallet-selector/selectors";
import { selectIsAuthorized } from "../auth/selectors";

export enum EUiType {
  APP = "app",
  ROUTER = "router",
  LAYOUT = "layout",
  WALLET_SELECTOR = "walletSelector",
  LANDING = "landing",
}

export enum EAppUi {
  LOADING = "loading",
  ERROR = "error",
  READY = "ready",
}



export enum ELayoutUi {
  LAYOUT_AUTHORIZED = "layoutAuthorized",
  LAYOUT_UNAUTHORIZED = "layoutUnauthorized",
  LAYOUT_TRANSITIONAL = "layoutTransitional"
}

export enum EWalletSelectorUi {
  LOADING = "loading",
  LIGHT_WALLET = "lightWallet",
  BROWSER_WALLET = "browserWallet",
  LEDGER_WALLET = "ledgerWallet",
}

function* initUi() {
  yield console.log("initUi");
  yield put(actions.ui.setUiData(EUiType.APP, { state: EAppUi.LOADING }));

  //TODO put action for ui to show loading state
  yield all([
    call(waitForContractsInit),
    call(waitForAppInit)
  ]);
  yield console.log("-----initUi init done");
  yield takeLatest([actions.ui.goTo/* ,auth change, login/logout */], appUiSaga)
  yield neuCall(initRouting);
  yield put(actions.ui.setUiData(EUiType.APP, { state: EAppUi.READY }));

}

function* initRouting() {
  const route = ERoute.LOGIN;
  yield put(actions.ui.goTo(route))
}

function* appUiSaga(action) {
  console.log(action)
  const layout = yield fork(layoutUiSaga)
  const content = yield fork(router)

}

function* router() {
  const route = yield select(selectRoute);

  switch (route) {
    case ERoute.LOGIN:
      yield put(actions.ui.setUiData(EUiType.ROUTER, { state: EUiType.WALLET_SELECTOR }));
      yield fork(walletSelectorUiSaga);
      break;
    default:
      yield put(actions.ui.setUiData(EUiType.ROUTER, { state: EUiType.LANDING }));
      yield call(landingUiSaga);
  }
}

function* layoutUiSaga() {
  console.log("layoutUiSaga start")
  const route = yield select(selectRoute);
  const userIsAuthorized = yield select(selectIsAuthorized);

  if (route === ERoute.LOGIN || route === ERoute.REGISTER) {
    yield put(actions.ui.setUiData(EUiType.LAYOUT, { state: ELayoutUi.LAYOUT_TRANSITIONAL }));
  } else {
    yield put(userIsAuthorized
      ? actions.ui.setUiData(EUiType.LAYOUT, { state: ELayoutUi.LAYOUT_AUTHORIZED })
      : actions.ui.setUiData(EUiType.LAYOUT, { state: ELayoutUi.LAYOUT_UNAUTHORIZED })
    );
  }
  console.log("layoutUiSaga end")
}

function* walletSelectorUiSaga() {
  console.log("walletSelectorUiSaga")
  yield put(actions.ui.setUiData(EUiType.WALLET_SELECTOR, { state: EWalletSelectorUi.LOADING }));
  yield put(actions.walletSelector.reset());

  const data = yield all({
    state: EWalletSelectorUi.LIGHT_WALLET,
    isMessageSigning: yield select(selectIsMessageSigning),
    rootPath: yield select(selectRoute),
    userType: yield select(selectUrlUserType),
    oppositeRoute: yield select(selectOppositeRootPath),
  });


  yield put(actions.ui.setUiData(EUiType.WALLET_SELECTOR, data))

}

function* landingUiSaga() {
}

// function* routing() {
//   yield console.log("routing")
// }

export function* uiSagas() {
  yield call(initUi);
  // yield fork(neuTakeEvery, "INIT_START", initUi);


  // yield fork(neuTakeEvery,actions.ui.goTo, routing );
}
