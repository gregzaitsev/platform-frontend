import * as React from "react";
import { hot } from "react-hot-loader/root";
import { branch, compose, renderComponent } from "recompose";


import { appConnect } from "../store";
import { ScrollToTop } from "../utils/ScrollToTop.unsafe";
import { withRootMetaTag } from "../utils/withMetaTags.unsafe";
import { CriticalError } from "./layouts/CriticalError";
import { GenericModal } from "./modals/GenericModal";
import { VideoModal } from "./modals/VideoModal";
import { AccessWalletModal } from "./modals/wallet-access/AccessWalletModal";
import { LoadingIndicator } from "./shared/loading-indicator";
import { ToastContainer } from "./shared/Toast";
import { selectUiData } from "../modules/ui/selectors";
import { EAppUiState } from "../modules/ui/reducer";
import { Layout } from "./layouts/Layout";
import { EAppUi, EUiType } from "../modules/ui/sagas";
import { NeverComponent } from "../utils/NeverComponent";
import { AppRouter } from "./AppRouter";

interface IState {
  renderingError: Error | null;
}

interface IStateProps {
  appState:EAppUiState
}


const AppReady = () =>
  <>
    <ScrollToTop>
      {console.log('app loaded')}
      <Layout dataKey={EUiType.LAYOUT}>
        <AppRouter dataKey="router"/>
      </Layout>
    </ScrollToTop>
    <AccessWalletModal />
    <ToastContainer />
    <GenericModal />
    <VideoModal />
  </>;

const App = compose<any,any>(
  withRootMetaTag(),
  appConnect<IStateProps>({
    stateToProps: s => selectUiData(s, EUiType.APP),
  }),
  branch<any>(({state}) => state === EAppUi.ERROR, renderComponent(CriticalError)),
  branch<any>(({state}) => state === EAppUi.LOADING, renderComponent(LoadingIndicator)),
  branch<any>(({state}) => state === EAppUi.READY, renderComponent(AppReady)),
)(NeverComponent("app"));

const AppHot = hot(App);

export { AppHot as App };
