import { RouterState } from "connected-react-router";
import * as queryString from "query-string";
import * as React from "react";
import { Redirect, Route } from "react-router-dom";
import { branch, compose, renderComponent } from "recompose";

import { EUserType } from "../../../lib/api/users/interfaces";
import { selectUserType } from "../../../modules/auth/selectors";
import { selectWalletTypeFromQueryString } from "../../../modules/routing/selectors";
import { EWalletType } from "../../../modules/web3/types";
import { appConnect } from "../../../store";
import { appRoutes } from "../../appRoutes";
import { loginWalletRoutes } from "../../wallet-selector/walletRoutes";

interface IStateProps {
  userType?: EUserType;
  walletType: EWalletType;
  routerState: RouterState;
}

interface IExternalProps {
  path: string;
  exact?: boolean;
  investorComponent?: React.ElementType;
  issuerComponent?: React.ElementType;
  nomineeComponent?: React.ElementType;
}

interface IComponentProps {
  walletType: EWalletType;
  userType: EUserType;
  routerState: RouterState;
}

type TProps = IExternalProps & IStateProps;

const selectRouteBasedOnWalletType = (walletType: EWalletType): string => {
  switch (walletType) {
    case EWalletType.LEDGER:
      return loginWalletRoutes.ledger;
    case EWalletType.BROWSER:
      return loginWalletRoutes.browser;
    default:
      return loginWalletRoutes.light;
  }
};

const OnlyAuthorizedRouteRedirectionComponent: React.FunctionComponent<TProps> = ({
  walletType,
  routerState,
  ...rest
}) => {
  const redirectionPath = {
    pathname: selectRouteBasedOnWalletType(walletType),
    search: queryString.stringify({
      redirect: routerState.location.pathname + routerState.location.search,
    }),
  };

  return <Route {...rest} render={() => <Redirect to={redirectionPath} />} />;
};

/**
 * This component will only attempt to redirect on entering the route. So when user gets logged in you need to trigger redirection on your own.
 */
const OnlyAuthorizedRouteComponent: React.FunctionComponent<IComponentProps & IExternalProps> = ({
  investorComponent: InvestorComponent,
  issuerComponent: IssuerComponent,
  nomineeComponent: NomineeComponent,
  userType,
  ...rest
}) => {
  const selectComponent = (userType: EUserType): React.ElementType | undefined => {
    switch (userType) {
      case EUserType.INVESTOR:
        return InvestorComponent;
      case EUserType.ISSUER:
        return IssuerComponent;
      case EUserType.NOMINEE:
        return NomineeComponent;
      default:
        return () => <div />;
    }
  };
  const Component = selectComponent(userType);

  return (
    <Route
      {...rest}
      render={props =>
        Component ? <Component {...props} /> : <Redirect to={appRoutes.dashboard} />
      }
    />
  );
};

export const OnlyAuthorizedRoute = compose<IComponentProps & IExternalProps, IExternalProps>(
  appConnect<IStateProps, {}, IExternalProps>({
    stateToProps: state => ({
      userType: selectUserType(state),
      walletType: selectWalletTypeFromQueryString(state),
      routerState: state.router,
    }),
  }),
  branch<IStateProps>(
    (props: IStateProps) => props.userType === undefined,
    renderComponent(OnlyAuthorizedRouteRedirectionComponent),
  ),
)(OnlyAuthorizedRouteComponent);
