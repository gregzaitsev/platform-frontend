import * as React from "react";
import { compose } from "recompose";

import { selectIsAuthorized } from "../../modules/auth/selectors";
import { appConnect } from "../../store";
import { TDataTestId } from "../../types";
import { AcceptTosModal } from "../modals/accept-tos-modal/AcceptTosModal";
import { BankTransferFlowModal } from "../modals/bank-transfer-flow/BankTransferFlow";
import { DepositEthModal } from "../modals/DepositEthModal";
import { DownloadTokenAgreementModal } from "../modals/download-token-agreements-modal/DownloadTokenAgreementModal";
import { IcbmWalletBalanceModal } from "../modals/icbm-wallet-balance-modal/IcbmWalletBalanceModal";
import { TxSenderModal } from "../modals/tx-sender/TxSender";
import { NotificationWidget } from "../shared/notification-widget/NotificationWidget";
import { Content } from "./Content";
import { Footer } from "./Footer";
import { HeaderAuthorized, HeaderUnauthorized } from "./header/Header";

import * as styles from "./Layout.module.scss";

interface IStateProps {
  userIsAuthorized: boolean;
}

interface ILayoutUnauthProps {
  hideHeaderCtaButtons?: boolean;
}

type TContentExternalProps = React.ComponentProps<typeof Content>;

export const LayoutUnauthorized: React.FunctionComponent<
  ILayoutUnauthProps & TContentExternalProps
> = ({ children, hideHeaderCtaButtons = false, ...contentProps }) => (
  <>
    <HeaderUnauthorized hideHeaderCtaButtons={hideHeaderCtaButtons} />
    <Content {...contentProps}>{children}</Content>
    <Footer />
  </>
);

export const LayoutAuthorized: React.FunctionComponent<TContentExternalProps> = ({
  children,
  ...contentProps
}) => (
  <>
    <HeaderAuthorized />
    <Content {...contentProps}>
      <NotificationWidget className={styles.notification} />
      {children}
    </Content>
    <Footer />
    <AcceptTosModal />
    <DepositEthModal />
    <TxSenderModal />
    <IcbmWalletBalanceModal />
    <BankTransferFlowModal />
    <DownloadTokenAgreementModal />
  </>
);

export const LayoutComponent: React.FunctionComponent<
  IStateProps & TDataTestId & TContentExternalProps & ILayoutUnauthProps
> = ({
  children,
  userIsAuthorized,
  hideHeaderCtaButtons = false,
  "data-test-id": dataTestId,
  ...contentProps
}) => (
  <div className={styles.layout} data-test-id={dataTestId}>
    {userIsAuthorized ? (
      <LayoutAuthorized {...contentProps}>{children}</LayoutAuthorized>
    ) : (
      <LayoutUnauthorized {...contentProps} hideHeaderCtaButtons={hideHeaderCtaButtons}>
        {children}
      </LayoutUnauthorized>
    )}
  </div>
);

export const Layout = compose<
  IStateProps,
  TDataTestId & TContentExternalProps & ILayoutUnauthProps
>(
  appConnect<IStateProps, {}, {}>({
    stateToProps: state => ({
      userIsAuthorized: selectIsAuthorized(state.auth),
    }),
  }),
)(LayoutComponent);
