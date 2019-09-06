import { channel, delay } from "redux-saga";
import { Effect, fork, put, take } from "redux-saga/effects";

import { SignInUserErrorMessage } from "../../components/translatedMessages/messages";
import { createMessage } from "../../components/translatedMessages/utils";
import { REDIRECT_CHANNEL_WATCH_DELAY } from "../../config/constants";
import { TGlobalDependencies } from "../../di/setupBindings";
import { STORAGE_JWT_KEY } from "../../lib/persistence/JwtObjectStorage";
import { USER_JWT_KEY as USER_KEY } from "../../lib/persistence/UserStorage";
import {
  SignerRejectConfirmationError,
  SignerTimeoutError,
} from "../../lib/web3/Web3Manager/Web3Manager";
import { assertNever } from "../../utils/assertNever";
import { actions, TActionFromCreator } from "../actions";
import { EInitType } from "../init/reducer";
import { neuCall, neuTakeEvery, neuTakeLatest } from "../sagasUtils";
import { verifyUserEmail } from "./email/sagas";
import { handleJwtTimeout } from "./jwt/sagas";
import { ELogoutReason, EUserAuthType } from "./types";
import { setUser, signInUser } from "./user/sagas";

function* handleLogOutUser(
  { web3Manager, jwtStorage, logger, userStorage }: TGlobalDependencies,
  action: TActionFromCreator<typeof actions.auth.logout>,
): Iterator<any> {
  const { logoutType = ELogoutReason.USER_REQUESTED } = action.payload;

  userStorage.clear();
  jwtStorage.clear();

  yield web3Manager.unplugPersonalWallet();

  yield put(actions.web3.personalWalletDisconnected());

  switch (logoutType) {
    case ELogoutReason.USER_REQUESTED:
      {
        yield put(actions.routing.goHome());
      }
      break;
    case ELogoutReason.SESSION_TIMEOUT:
      yield put(actions.routing.goToLogin({ logoutReason: ELogoutReason.SESSION_TIMEOUT }));
      break;
    case ELogoutReason.ALREADY_LOGGED_IN:
      logger.warn(
        new Error(
          "Seems like there is already active session. Please check the reason as this may be a potential bug.",
        ),
      );
      // no action is required
      break;
    default:
      assertNever(logoutType);
  }

  yield put(actions.init.appStart());

  logger.setUser(null);
}

function* handleSignInUser({ logger }: TGlobalDependencies): Iterator<any> {
  try {
    yield neuCall(signInUser);
  } catch (e) {
    logger.error("User Sign in error", e);

    if (e instanceof SignerRejectConfirmationError) {
      yield put(
        actions.walletSelector.messageSigningError(
          createMessage(SignInUserErrorMessage.MESSAGE_SIGNING_REJECTED),
        ),
      );
    } else if (e instanceof SignerTimeoutError) {
      yield put(
        actions.walletSelector.messageSigningError(
          createMessage(SignInUserErrorMessage.MESSAGE_SIGNING_TIMEOUT),
        ),
      );
    } else {
      yield put(
        actions.walletSelector.messageSigningError(
          createMessage(SignInUserErrorMessage.MESSAGE_SIGNING_SERVER_CONNECTION_FAILURE),
        ),
      );
    }
  }
}

/**
 * Multi browser logout/login feature
 */
const redirectChannel = channel<{ type: EUserAuthType }>();

/**
 * Saga that starts an Event Channel Emitter that listens to storage
 * events from the browser
 */
export function* startRedirectChannel(): any {
  window.addEventListener("storage", (evt: StorageEvent) => {
    if (evt.key === STORAGE_JWT_KEY && evt.oldValue && !evt.newValue) {
      redirectChannel.put({
        type: EUserAuthType.LOGOUT,
      });
    }
    if (evt.key === USER_KEY && !evt.oldValue && evt.newValue) {
      redirectChannel.put({
        type: EUserAuthType.LOGIN,
      });
    }
  });
}

/**
 * Saga that watches events coming from redirectChannel and
 * dispatches login/logout actions
 */
export function* watchRedirectChannel(): any {
  yield startRedirectChannel();
  while (true) {
    const userAction = yield take(redirectChannel);
    switch (userAction.type) {
      case EUserAuthType.LOGOUT:
        yield put(actions.auth.logout());
        break;
      case EUserAuthType.LOGIN:
        yield put(actions.init.appStart());
        break;
    }
    yield delay(REDIRECT_CHANNEL_WATCH_DELAY);
  }
}

export function* authSagas(): Iterator<Effect> {
  yield fork(watchRedirectChannel);

  yield fork(neuTakeLatest, actions.auth.logout, handleLogOutUser);
  yield fork(neuTakeEvery, actions.auth.setUser, setUser);
  yield fork(neuTakeEvery, actions.auth.verifyEmail, verifyUserEmail);
  yield fork(neuTakeEvery, "WALLET_SELECTOR_CONNECTED", handleSignInUser);
  yield fork(neuTakeLatest, actions.auth.loadJWT, handleJwtTimeout);
}
