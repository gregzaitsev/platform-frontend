import * as React from "react";
import { match } from "react-router";
import { branch, compose, renderNothing, withHandlers, withProps } from "recompose";

import { EUserType } from "../../../lib/api/users/interfaces";
import { actions } from "../../../modules/actions";
import { selectUserType } from "../../../modules/auth/selectors";
import { userHasKycAndEmailVerified } from "../../../modules/eto-flow/selectors";
import { selectIsActionRequiredSettings } from "../../../modules/notifications/selectors";
import { appConnect } from "../../../store";
import { MenuBase } from "./MenuBase";
import { accountMenuData, investorMenuData, issuerMenuData, menuSeparatorData } from "./MenuData";
import { DropdownMenuEntry, TMenuEntry } from "./MenuEntry";

import * as close from "../../../assets/img/close.svg";
import * as hamburger from "../../../assets/img/hamburger.svg";
import * as styles from "./MobileMenu.module.scss";

interface IStateProps {
  userType: EUserType | undefined;
  actionRequired: boolean;
  userHasKycAndVerifiedEmail: boolean;
}

interface IDispatchProps {
  logout: () => void;
}

interface IProps {
  userType: EUserType;
  isLinkActive: (match: match<unknown>) => boolean;
  userHasKycAndVerifiedEmail: boolean;
  actionRequired: boolean;
  logout: () => void;
}

interface IHandlers {
  isLinkActive: (match: match<unknown>) => boolean;
}

interface IMenuData {
  data: TMenuEntry[];
}

const initMobileMenuData = ({
  actionRequired,
  isLinkActive,
  userType,
  logout,
  userHasKycAndVerifiedEmail,
}: IProps): TMenuEntry[] => {
  const accountMenu = accountMenuData(actionRequired, isLinkActive, logout);

  const data =
    userType === EUserType.INVESTOR
      ? investorMenuData(isLinkActive).concat(accountMenu)
      : issuerMenuData(userHasKycAndVerifiedEmail).concat(accountMenu);

  data.splice(-2, 0, menuSeparatorData("separator-1"));

  return data;
};

export const Menu: React.FunctionComponent<IMenuData> = ({ data }) => (
  <div className={styles.menu}>
    <div className={styles.menuInner}>
      {data.map(entry => (
        <DropdownMenuEntry {...entry} />
      ))}
    </div>
  </div>
);

export const MobileMenuLayout: React.FunctionComponent<IMenuData> = props => (
  <MenuBase
    closedElement={<img src={hamburger} alt="menu" />}
    openElement={<img src={close} alt="menu" />}
    className={styles.mobileMenu}
    renderMenu={<Menu data={props.data} />}
  />
);

export const MobileMenu = compose<IMenuData & IHandlers, {}>(
  appConnect<IStateProps | null, IDispatchProps>({
    stateToProps: state => {
      const userType = selectUserType(state);
      if (userType !== undefined) {
        return {
          userType: selectUserType(state),
          actionRequired: selectIsActionRequiredSettings(state),
          userHasKycAndVerifiedEmail: userHasKycAndEmailVerified(state),
        };
      } else {
        return null;
      }
    },
    dispatchToProps: dispatch => ({
      logout: () => {
        dispatch(actions.auth.logout());
      },
    }),
  }),
  branch<IStateProps | null>(props => props === null, renderNothing),
  withHandlers<IProps, IHandlers>({
    isLinkActive: () => match => Boolean(match),
  }),
  withProps<IMenuData, IProps>(props => {
    const data = initMobileMenuData({
      actionRequired: props.actionRequired,
      isLinkActive: props.isLinkActive,
      userType: props.userType,
      logout: props.logout,
      userHasKycAndVerifiedEmail: props.userHasKycAndVerifiedEmail,
    });
    return { data };
  }),
)(MobileMenuLayout);
