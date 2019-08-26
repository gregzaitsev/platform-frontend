import "reflect-metadata";

import "./components/translatedMessages/yupLocales.sideEffect";

import "font-awesome/scss/font-awesome.scss";
import "slick-carousel/slick/slick-theme.css";
import "slick-carousel/slick/slick.css";
import "./styles/bootstrap.scss";
import "./styles/overrides.scss";

// tslint:disable-next-line:ordered-imports
import { routerMiddleware } from "connected-react-router";
import { createBrowserHistory, History } from "history";
import { Container } from "inversify";
import { compact } from "lodash";
import * as React from "react";
import * as ReactDOM from "react-dom";
import { initializePhraseAppEditor } from "react-intl-phraseapp";
import { Provider as ReduxProvider } from "react-redux";
import { applyMiddleware, createStore, Store } from "redux";
import { composeWithDevTools } from "redux-devtools-extension";
import createSagaMiddleware from "redux-saga";

import { App } from "./components/App";
import { getConfig } from "./config/getConfig";
import { createGlobalDependencies, setupBindings, TGlobalDependencies } from "./di/setupBindings";
import { symbols } from "./di/symbols";
import { ILogger } from "./lib/dependencies/logger";
import { reduxLogger } from "./middlewares/redux-logger";
import { rootSaga } from "./modules/sagas";
import { generateRootReducer, IAppState } from "./store";
import { IntlProviderAndInjector } from "./utils/IntlProviderAndInjector";
import { InversifyProvider } from "./utils/InversifyProvider";

function renderApp(
  store: Store<IAppState>,
  container: Container,
  Component: React.ComponentType,
): void {
  const mountNode = document.getElementById("app");

  ReactDOM.render(
    <ReduxProvider store={store}>
      <InversifyProvider container={container}>
        <IntlProviderAndInjector>
            <Component />
        </IntlProviderAndInjector>
      </InversifyProvider>
    </ReduxProvider>,
    mountNode,
  );
}

function startupApp(history: History): { store: Store<IAppState>; container: Container } {
  const config = getConfig(process.env);
  const container = setupBindings(config);

  const context: { container: Container; deps?: TGlobalDependencies } = {
    container,
  };

  const logger = container.get<ILogger>(symbols.logger);

  const sagaMiddleware = createSagaMiddleware({ context });

  const middleware = applyMiddleware(
    ...compact([
      routerMiddleware(history),
      sagaMiddleware,
      process.env.NODE_ENV === "production" && reduxLogger(logger),
    ]),
  );

  const rootReducer = generateRootReducer(history);

  const store: Store<IAppState> =
    process.env.NODE_ENV === "production"
      ? createStore(rootReducer, middleware)
      : createStore(rootReducer, composeWithDevTools(middleware));

  // we have to create the dependencies here, because getState and dispatch get
  // injected in the middleware step above, maybe change this later
  context.deps = createGlobalDependencies(container);
  sagaMiddleware.run(rootSaga, store.dispatch);

  return { store, container };
}

if (process.env.NF_ENABLE_TRANSLATE_OVERLAY) {
  const config = {
    projectId: process.env.NF_TRANSLATION_ID!,
    phraseEnabled: true,
    prefix: "[[__",
    suffix: "__]]",
  };
  initializePhraseAppEditor(config);
}

const history = createBrowserHistory();
const { store, container } = startupApp(history);
renderApp(store, container, App);
