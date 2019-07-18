import { includes, some } from "lodash";

import { appRoutes } from "../../components/appRoutes";
import { IAppState } from "../../store";
import {
  selectBackupCodesVerified,
  selectIsInvestor,
  selectIsUserEmailVerified,
  selectUserType,
} from "../auth/selectors";
import { selectKycLoading, selectKycRequestStatus } from "../kyc/selectors";
import { INotification, settingsNotificationInvestor, settingsNotificationIssuer } from "./reducer";
import { EUserType } from "../../lib/api/users/interfaces";

export const selectNotifications = (state: IAppState): ReadonlyArray<INotification> =>
  state.notifications.notifications;

export const selectIsActionRequiredSettings = (state: IAppState): boolean => {
  if (selectKycLoading(state.kyc)) {
    return false;
  }
  return (
    !selectIsUserEmailVerified(state.auth) ||
    !selectBackupCodesVerified(state) ||
    !includes(["Outsourced", "Pending", "Accepted"], selectKycRequestStatus(state))
  );
};

/**
 * Hides notification on blacklisted routes.
 */
export const selectIsVisibleSecurityNotification = (state: IAppState): boolean => {
  const disallowedViewsPaths = [appRoutes.profile, appRoutes.kyc];
  const userType = selectUserType(state);

  if(userType === EUserType.NOMINEE){
    return false;
  }

  if (
    state.router.location &&
    some(disallowedViewsPaths, p => state.router.location.pathname.startsWith(p))
  ) {
    return false;
  }

  return selectIsActionRequiredSettings(state);
};

export const selectSettingsNotificationType = (state: IAppState) =>
  selectIsInvestor(state) ? settingsNotificationInvestor() : settingsNotificationIssuer();

export const selectSettingsNotification = (state: IAppState) =>
  selectIsVisibleSecurityNotification(state) ? selectSettingsNotificationType(state) : undefined;
