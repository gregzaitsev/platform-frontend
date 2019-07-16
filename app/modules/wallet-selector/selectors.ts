import { RouterState } from "connected-react-router";

import { appRoutes } from "../../components/appRoutes";
import { EUserType } from "../../lib/api/users/interfaces";
import { IAppState } from "../../store";

export const selectUrlUserType = (router: RouterState): EUserType => {
  if (router.location && router.location.pathname.includes("eto")) {
    return EUserType.ISSUER;
  } else if (router.location && router.location.pathname.includes("nominee")) {
    return EUserType.NOMINEE;
  } else {
    return EUserType.INVESTOR;
  }
};

export const selectIsLoginRoute = (state: RouterState): boolean =>
  !!state.location && state.location.pathname.includes("login");

export const selectRootPath = (state: RouterState): string => {
  switch(selectUrlUserType(state)){
    case EUserType.ISSUER:
      return selectIsLoginRoute(state) ? appRoutes.loginEto : appRoutes.registerIssuer;
    case EUserType.NOMINEE:
      return selectIsLoginRoute(state) ? appRoutes.login : appRoutes.registerNominee;
    case EUserType.INVESTOR:
    default:
      return selectIsLoginRoute(state) ? appRoutes.login : appRoutes.register;
  }
};

export const selectOppositeRootPath = (state: RouterState): string => {
  if (selectUrlUserType(state) === EUserType.INVESTOR) {
    return selectIsLoginRoute(state) ? appRoutes.register : appRoutes.login;
  } else {
    return selectIsLoginRoute(state) ? appRoutes.registerIssuer : appRoutes.loginEto;
  }
};

export const selectIsMessageSigning = (state: IAppState): boolean =>
  !!state.walletSelector.isMessageSigning;
