import * as cn from "classnames";
import * as React from "react";
import { FormattedMessage } from "react-intl-phraseapp";
import { Link } from "react-router-dom";
import { compose } from "recompose";

import { TxPendingWithMetadata } from "../../../lib/api/users/interfaces";
import { actions } from "../../../modules/actions";
import { selectPlatformPendingTransaction } from "../../../modules/tx/monitor/selectors";
import { appConnect } from "../../../store";
import { appRoutes } from "../../appRoutes";
import { ButtonLink, EButtonTheme } from "../../shared/buttons/index";
import { loginWalletRoutes, walletRegisterRoutes } from "../../wallet-selector/walletRoutes";
import { MenuAuthorized } from "../menus/MenuAuthorized";
import { MobileMenu } from "../menus/MobileMenu";
import { MyAccountMenu } from "../menus/MyAccountMenu";
import { PendingTransactionStatus } from "./PendingTransactionStatus";

import * as logoNew from "../../../assets/img/logo_neufund_on_white.svg";
import * as logoNewTitle from "../../../assets/img/logo_neufund_on_white_title.svg";
import * as styles from "./Header.module.scss";

interface IHeaderButton {
  className: string;
  isIssuerLocation: boolean;
}

interface IStateProps {
  location?: string;
  pendingTransaction?: TxPendingWithMetadata;
}

interface IDispatchProps {
  monitorPendingTransaction: () => void;
}

interface IAuthHeader {
  pendingTransaction?: TxPendingWithMetadata;
}

interface IHeaderUnauthProps {
  isIssuerLocation: boolean;
}

interface IHeaderUnauthExternalProps {
  hideHeaderCtaButtons: boolean;
}

export const LogoUnauth = () => (
  <Link to={appRoutes.root} className={styles.logoUnauth}>
    <img src={logoNew} alt="NEUFUND" className={styles.logoImage} />
    <img src={logoNewTitle} alt="NEUFUND" className={styles.logoTitle} />
  </Link>
);

export const LogoAuth = () => (
  <Link to={appRoutes.root} className={styles.logoAuth}>
    <img src={logoNew} alt="NEUFUND" className={styles.logoImage} />
    <img src={logoNewTitle} alt="NEUFUND" className={styles.logoTitleAuth} />
  </Link>
);

export const LoginButton: React.FunctionComponent<IHeaderButton> = ({
  className,
  isIssuerLocation,
}) => (
  <ButtonLink
    className={className}
    theme={EButtonTheme.DARK_NO_BORDER}
    innerClassName={cn(styles.buttonInner)}
    data-test-id={isIssuerLocation ? "Header-login-eto" : "Header-login"}
    isActive={false}
    to={isIssuerLocation ? appRoutes.loginEto : loginWalletRoutes.light}
  >
    <FormattedMessage id="header.login-button" />
  </ButtonLink>
);

export const GetStartedButton: React.FunctionComponent<IHeaderButton> = ({
  className,
  isIssuerLocation,
}) => (
  <ButtonLink
    className={className}
    theme={EButtonTheme.BRAND}
    innerClassName={styles.buttonInner}
    data-test-id={isIssuerLocation ? "Header-register-eto" : "Header-register"}
    isActive={false}
    to={isIssuerLocation ? appRoutes.registerIssuer : walletRegisterRoutes.light}
  >
    <FormattedMessage id="header.get-started-button" />
  </ButtonLink>
);

export const HeaderUnauthComponent: React.FunctionComponent<
  IHeaderUnauthProps & IHeaderUnauthExternalProps
> = ({ hideHeaderCtaButtons, isIssuerLocation }) => (
  <div className={styles.headerUnauth}>
    <LogoUnauth />
    {!hideHeaderCtaButtons && (
      <>
        <LoginButton className={styles.button} isIssuerLocation={isIssuerLocation} />
        <GetStartedButton className={styles.button} isIssuerLocation={isIssuerLocation} />
      </>
    )}
  </div>
);

export const HeaderAuthComponent: React.FunctionComponent<IAuthHeader & IDispatchProps> = ({
  monitorPendingTransaction,
  pendingTransaction,
}) => (
  <div className={styles.headerAuth}>
    <MobileMenu />
    <LogoAuth />
    <MenuAuthorized />
    <PendingTransactionStatus
      className={styles.transactionStatus}
      monitorPendingTransaction={monitorPendingTransaction}
      pendingTransaction={pendingTransaction}
    />
    <MyAccountMenu />
  </div>
);

export const HeaderAuthorized = compose<IStateProps & IDispatchProps, {}>(
  appConnect<IStateProps, IDispatchProps>({
    stateToProps: s => ({
      location: s.router.location && s.router.location.pathname,
      pendingTransaction: selectPlatformPendingTransaction(s),
    }),
    dispatchToProps: dispatch => ({
      monitorPendingTransaction: () => {
        dispatch(actions.txMonitor.monitorPendingPlatformTx());
      },
    }),
  }),
)(HeaderAuthComponent);

export const HeaderUnauthorized = compose<
  IHeaderUnauthProps & IHeaderUnauthExternalProps,
  IHeaderUnauthExternalProps
>(
  appConnect<IHeaderUnauthProps, {}>({
    stateToProps: s => ({
      isIssuerLocation: Boolean(
        s.router.location &&
          s.router.location.pathname &&
          s.router.location.pathname.indexOf("eto") !== -1,
      ),
    }),
  }),
)(HeaderUnauthComponent);
