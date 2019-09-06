import * as React from "react";
import { branch, compose, renderComponent } from "recompose";

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
import { HeaderAuthorized, HeaderTransitional, HeaderUnauthorized } from "./header/Header";

import * as styles from "./Layout.module.scss";
import { selectUiData } from "../../modules/ui/selectors";
import { ELayoutUi, EUiType } from "../../modules/ui/sagas";
import { renderComponentWithProps } from "../../utils/renderComponentWithProps";

interface IStateProps {
  userIsAuthorized: boolean;
}

interface ILayoutUnauthProps {
  hideHeaderCtaButtons?: boolean;
}

type TContentExternalProps = React.ComponentProps<typeof Content>;

export const LayoutBase: React.FunctionComponent<TDataTestId> = ({
  children,
  "data-test-id": dataTestId,
}) => (
  <div className={styles.layout} data-test-id={dataTestId}>
    {children}
  </div>
);

export const LayoutUnauthorized: React.FunctionComponent<TDataTestId> =
  ({ children,"data-test-id": dataTestId }) => (
  <LayoutBase data-test-id={dataTestId} >
    <HeaderUnauthorized dataKey="header" />
    <Content  dataKey="content">
      {children}
    </Content>
    <Footer dataKey="footer"/>
  </LayoutBase>
);

export const LayoutTransitional: React.FunctionComponent<TDataTestId> =
  ({ children,"data-test-id": dataTestId }) => (
  <LayoutBase data-test-id={dataTestId}>
    <HeaderTransitional dataKey="header"/>
    <Content  dataKey="content">
      {children}
    </Content>
    <Footer dataKey="footer"/>
  </LayoutBase>
);

export const LayoutAuthorized: React.FunctionComponent<TDataTestId> = ({
  children,
  "data-test-id": dataTestId
}) => (
  <LayoutBase data-test-id={dataTestId}>
    <HeaderAuthorized  dataKey="header"/>
    <Content dataKey="content">
      <NotificationWidget className={styles.notification} />
      {children}
    </Content>
    <Footer dataKey="footer"/>
    <AcceptTosModal dataKey="acceptTosModal"/>
    <DepositEthModal dataKey="depositEthModal"/>
    <TxSenderModal dataKey="txSenderModal"/>
    <IcbmWalletBalanceModal dataKey="icbmWalletBalanceModal"/>
    <BankTransferFlowModal dataKey="bankTransferFlowModal"/>
    <DownloadTokenAgreementModal dataKey="downloadTokenAgreementModal"/>
  </LayoutBase>
);

export const Layout = compose<
  IStateProps,
  TDataTestId & TContentExternalProps & ILayoutUnauthProps
>(
  appConnect<IStateProps, {}, {dataKey: EUiType}>({
    stateToProps: (state,{dataKey}) => selectUiData(state, dataKey),
  }),
  branch<any>((props) => {console.log("Layout",props);return props.state === ELayoutUi.LAYOUT_TRANSITIONAL}, renderComponentWithProps({dataKey: 'layoutTransitional'},LayoutTransitional)),
  branch<any>(({state}) => state === ELayoutUi.LAYOUT_UNAUTHORIZED, renderComponentWithProps({dataKey: 'layoutUnauthorized'},LayoutUnauthorized)),
  branch<any>(({state}) => state === ELayoutUi.LAYOUT_AUTHORIZED, renderComponentWithProps({dataKey: 'layoutAuthorized'},LayoutAuthorized)),
)(props=>{throw("Layout : blia!", props)});
