import * as React from "react";
import { match } from "react-router";
import { branch, compose, renderNothing, withHandlers } from "recompose";

import { EUserType } from "../../../lib/api/users/interfaces";
import { selectUserType } from "../../../modules/auth/selectors";
import { userHasKycAndEmailVerified } from "../../../modules/eto-flow/selectors";
import { selectIsActionRequiredSettings } from "../../../modules/notifications/selectors";
import { appConnect } from "../../../store";
import { assertNever } from "../../../utils/assertNever";
import { investorMenuData, issuerMenuData, nomineeMenuData } from "./MenuData";
import { MenuEntry } from "./MenuEntry";

import * as styles from "./MenuAuthorized.module.scss";

interface IStateProps {
  userType: EUserType;
  userHasKycAndVerifiedEmail: boolean;
  actionRequired: boolean;
}

interface IWithProps {
  isLinkActive: (match: match<unknown>) => boolean;
}

interface IInvestorMenuProps {
  isLinkActive: (match: match<unknown>) => boolean;
}

interface IIssuerMenuProps {
  userHasKycAndVerifiedEmail: boolean;
}

interface INomineeMenuProps {
  userHasKycAndVerifiedEmail: boolean;
}

const InvestorMenu: React.FunctionComponent<IInvestorMenuProps> = ({ isLinkActive }) => {
  const data = investorMenuData(isLinkActive);

  return (
    <div className={styles.menu}>
      {data.map(entry => (
        <MenuEntry {...entry} />
      ))}
    </div>
  );
};

const IssuerMenu: React.FunctionComponent<IIssuerMenuProps> = ({ userHasKycAndVerifiedEmail }) => {
  const data = issuerMenuData(userHasKycAndVerifiedEmail);
  return (
    <div className={styles.menu}>
      {data.map(entry => (
        <MenuEntry {...entry} />
      ))}
    </div>
  );
};

const NomineeMenu: React.FunctionComponent<INomineeMenuProps> = ({
  userHasKycAndVerifiedEmail,
}) => {
  const data = nomineeMenuData(userHasKycAndVerifiedEmail);
  return (
    <div className={styles.menu}>
      {data.map(entry => (
        <MenuEntry {...entry} />
      ))}
    </div>
  );
};

const LayoutAuthorizedMenuComponent: React.FunctionComponent<IStateProps & IWithProps> = ({
  userType,
  ...props
}) => {
  switch (userType) {
    case EUserType.INVESTOR:
      return <InvestorMenu data-test-id="investor-menu" {...props} />;
    case EUserType.ISSUER:
      return <IssuerMenu data-test-id="issuer-menu" {...props} />;
    case EUserType.NOMINEE:
      return <NomineeMenu data-test-id="nominee-menu" {...props} />;
    default:
      return assertNever(userType);
  }
};

const MenuAuthorized = compose<IStateProps & IWithProps, {}>(
  appConnect<IStateProps | null, {}>({
    stateToProps: state => {
      const userType = selectUserType(state);
      if (userType !== undefined) {
        return {
          userType,
          actionRequired: selectIsActionRequiredSettings(state),
          userHasKycAndVerifiedEmail: userHasKycAndEmailVerified(state),
        };
      } else {
        return null;
      }
    },
  }),
  branch<IStateProps | null>(props => props === null, renderNothing),
  withHandlers<IStateProps, IWithProps>({
    isLinkActive: () => match => Boolean(match),
  }),
)(LayoutAuthorizedMenuComponent);

export { InvestorMenu, IssuerMenu, MenuAuthorized, LayoutAuthorizedMenuComponent };
