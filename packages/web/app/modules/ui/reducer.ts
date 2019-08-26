import { AppReducer } from "../../store";
import { DeepReadonly } from "../../types";
import { actions } from "../actions";

export enum ERoute {
  VERIFY = "/email-verify",
  ICBM_MIGRATION = "/migrate",
  WALLET_UNLOCK = "/wallet-unlock-etherlock",

  ROOT = "/",

  REGISTER = "/register",

  REGISTER_ISSUER = "/eto/register",

  REGISTER_NOMINEE = "/nominee/register",
  LOGIN = "/login",

  RESTORE = "/restore",

  ETO_ISSUER_VIEW = "/eto/view",

  ETO_PUBLIC_VIEW = "/eto/view/=jurisdiction/=previewCode",
  ETO_PUBLIC_VIEW_BY_ID = "/eto/by-id/=jurisdiction/=etoId",

  ETO_WIDGET_VIEW = "/embed/eto/widget/=previewCode",

  KYC = "/kyc",
  WALLET = "/wallet",
  DASHBOARD = "/dashboard",
  DOCUMENTS = "/documents",
  PROFILE = "/profile",
  DEMO = "/demo",
  ETO = "/eto",
  ETO_LANDING = "/eto-landing",

  ETO_REGISTER = "/eto/registration",

  PORTFOLIO = "/portfolio",

  UNSUBSCRIPTION = "/unsubscription/=email",
  UNSUBSCRIPTION_SUCCESS = "/unsubscription/success",

  /*
   * the following routes shouldn't be used in the code,
   * they are only there to catch accidental user input
   * or for backward compatibility
   */

  /*
   * @deprecated
   * */
  LOGIN_ISSUER = "/eto/login",
  /*
   * @deprecated
   * */
  LOGIN_NOMINEE = "/nominee/login",
  /*
  @deprecated
   */
  RESTORE_ISSUER = "/eto/restore",
  /*
   * @deprecated
   * */
  RESTORE_NOMINEE = "/nominee/restore",
  /*
   * @deprecated Route with eto jurisdiction should be used instead. This is only for backward compatibility.
   */
  ETO_PUBLIC_VIEW_BY_ID_LEGACY_ROUTE = "/eto/by-id/=etoId",
  /*
   * @deprecated Route with eto jurisdiction should be used instead. This is only for backward compatibility.
   */
  ETO_PUBLIC_VIEW_LEGACY_ROUTE = "/eto/view/=previewCode",
}

export enum EAppUiState {
  NOT_STARTED = "notStarted",
  IN_PROGRESS = "inProgress",
  INIT_DONE = "initDone",
  INIT_ERROR = "initError",
}

export type TUi = {
  route: ERoute,
  app: EAppUiState,
  walletSelector: TWalletSelectorData
  accessWalletModal: null
  toastContainer: null
  genericModal: null
  videoModal: null
}

export type TWalletSelectorData = null | {}

const uiInitialState = {
  route: ERoute.ROOT,
  app: EAppUiState.NOT_STARTED,
  walletSelector: null,
  accessWalletModal: null,
  toastContainer: null,
  genericModal: null,
  videoModal: null,
}

export const uiReducer: AppReducer<TUi> = (
  state = uiInitialState,
  action
): DeepReadonly<any> => {
  switch (action.type) {
    case actions.ui.goTo.getType():
      return {
        ...state,
        route: action.payload.to
      }
    case actions.ui.goToDashboard.getType():
      return {
        ...state,
        route: ERoute.DASHBOARD
      }
    case actions.ui.goToProfile.getType():
      return {
        ...state,
        route: ERoute.PROFILE
      }
    case actions.ui.goToWallet.getType():
      return {
        ...state,
        route: ERoute.WALLET
      }
    default:
      return state
  }
}
