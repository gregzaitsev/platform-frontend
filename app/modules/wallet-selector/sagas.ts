import { effects } from "redux-saga";
import { fork } from "redux-saga/effects";

import { EUserType } from "../../lib/api/users/interfaces";
import { IAppState } from "../../store";
import { neuCall, neuTakeEvery } from "../sagasUtils";
import { loadPreviousWallet } from "../web3/sagas";
import { selectUrlUserTypeForLoginOrRegistration } from "./selectors";

export function* loadWalletFromUrl(): Iterator<any> {
  const userType: EUserType = yield effects.select((s: IAppState) => selectUrlUserTypeForLoginOrRegistration(s.router));
  // when going through default registration/login allow to acquire any previous wallet, otherwise force specific type
  yield neuCall(loadPreviousWallet, userType === EUserType.INVESTOR ? undefined : userType);
}

export function* walletSelectorSagas(): Iterator<any> {
  yield fork(neuTakeEvery, "WALLET_SELECTOR_RESET", loadWalletFromUrl);
}
