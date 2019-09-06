import { appRoutes } from "../../components/appRoutes";
import { EUserType } from "../../lib/api/users/interfaces";
import { IAppState } from "../../store";

export const selectUrlUserType = (state: IAppState): EUserType => {
  if (state.router.location && state.router.location.pathname.includes("eto")) {
    return EUserType.ISSUER;
  } else if (state.router.location && state.router.location.pathname.includes("nominee")) {
    return EUserType.NOMINEE;
  } else {
    return EUserType.INVESTOR;
  }
};

export const selectIsLoginRoute = (state: IAppState): boolean =>
  true
  // !!state.router.location && state.router.location.pathname.includes("login");

export const selectRootPath = (state: IAppState): string => {
  switch (selectUrlUserType(state)) {
    case EUserType.ISSUER:
      return selectIsLoginRoute(state) ? appRoutes.loginIssuer : appRoutes.registerIssuer;
    case EUserType.NOMINEE:
      return selectIsLoginRoute(state) ? appRoutes.login : appRoutes.registerNominee;
    case EUserType.INVESTOR:
    default:
      return selectIsLoginRoute(state) ? appRoutes.login : appRoutes.register;
  }
};

export const selectOppositeRootPath = (state: IAppState): string =>
  selectIsLoginRoute(state) ? appRoutes.register : appRoutes.login;

export const selectIsMessageSigning = (state: IAppState): boolean =>
  !!state.walletSelector.isMessageSigning;
