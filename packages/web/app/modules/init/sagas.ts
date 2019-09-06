import { effects } from "redux-saga";
import { call, fork, put, select, take } from "redux-saga/effects";

import { TGlobalDependencies } from "../../di/setupBindings";
import { IAppState } from "../../store";
import { isJwtExpiringLateEnough } from "../../utils/JWTUtils";
import { actions } from "../actions";
import { loadJwt, setJwt } from "../auth/jwt/sagas";
import { loadUser } from "../auth/user/sagas";
import { initializeContracts, populatePlatformTermsConstants } from "../contracts/sagas";
import { neuCall, neuTakeEvery } from "../sagasUtils";
import { detectUserAgent } from "../user-agent/sagas";
import { initWeb3ManagerEvents } from "../web3/sagas";
import { EInitType } from "./reducer";
import { selectIsAppInitDone, selectIsContractsInitDone, selectIsSmartContractInitDone } from "./selectors";

function* initSmartcontracts({ web3Manager, logger }: TGlobalDependencies): any {
  try {
    yield fork(neuCall, initWeb3ManagerEvents);
    yield web3Manager.initialize();

    yield neuCall(initializeContracts);
    yield neuCall(populatePlatformTermsConstants);

    yield put(actions.init.contractsDone());
  } catch (e) {
    yield put(
      actions.init.contractsError(
        "Error while connecting with Ethereum blockchain",
      ),
    );
    logger.error("Smart Contract Init Error", e);
  }
}

function* initApp({ logger }: TGlobalDependencies): any {
  try {
    yield neuCall(detectUserAgent);

    const jwt = yield neuCall(loadJwt);

    if (jwt) {
      if (isJwtExpiringLateEnough(jwt)) {
        try {
          yield neuCall(setJwt, jwt);

          // we need to initiate smartcontracts anyway to load user properly
          if (yield checkIfSmartcontractsInitNeeded()) {
            yield neuCall(initSmartcontracts);
          }

          yield loadUser();
        } catch (e) {
          yield put(actions.auth.logout());
          logger.error(
            "Cannot retrieve account. This could happen b/c account was deleted on backend",
          );
        }
      } else {
        yield put(actions.auth.logout());
        logger.info("JTW expiring too soon.");
      }
    }

    yield put(actions.init.done(EInitType.APP_INIT));
  } catch (e) {
    yield put(actions.init.error(EInitType.APP_INIT, e.message || "Unknown error"));
    logger.error("App init error", e);
  }
}

export function* checkIfSmartcontractsInitNeeded(): any {
  const isDoneOrInProgress: boolean = yield select(
    (s: IAppState) => s.init.smartcontractsInit.done || s.init.smartcontractsInit.inProgress,
  );

  return !isDoneOrInProgress;
}

export function* initSmartcontractsOnce(): any {
  const isNeeded = yield checkIfSmartcontractsInitNeeded();
  if (!isNeeded) {
    return;
  }

  yield put(actions.init.contractsStart());
}

export function* waitUntilSmartContractsAreInitialized(): Iterator<any> {
  const isSmartContractsInitialized = yield select(selectIsSmartContractInitDone);

  if (!isSmartContractsInitialized) {
    yield take(actions.init.contractsDone);
  }
  return;
}

export function* waitForContractsInit(): Iterator<any> {
  const isSmartContractsInitialized = yield select(selectIsContractsInitDone);

  if (!isSmartContractsInitialized) {
    yield take([
      actions.init.contractsDone,
      actions.init.contractsError
    ]);
  }
  return;
}

export function* waitForAppInit(): Iterator<any> {
  const isSmartContractsInitialized = yield select(selectIsAppInitDone);

  if (!isSmartContractsInitialized) {
    yield take([
      actions.init.done,
      actions.init.error
    ]);
  }
  return;
}

export const initSagas = function*(): Iterator<effects.Effect> {
  yield call(neuCall, initApp);
  // yield fork(neuTakeEvery, actions.init.appStart, initApp);
  yield fork(neuTakeEvery, actions.init.contractsStart, initSmartcontracts);
  // Smart Contracts are only initialized once during the whole life cycle of the app
  yield fork(initSmartcontractsOnce);
};
