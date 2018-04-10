import * as React from "react";
import { Redirect, Route, Switch } from "react-router-dom";
import { parentRoutePath, walletRoutes } from "./routes";
import { DepositEth } from "./views/deposit-funds/DepositEth";
import { DepositEuroToken } from "./views/deposit-funds/DepositEuroToken";
import { WalletStart } from "./views/start/Start";

export const WalletRouter: React.SFC = () => (
  <Switch>
    <Route path={parentRoutePath} component={WalletStart} exact />

    {/* Deposit Funds */}
    <Route path={walletRoutes.euroToken} component={DepositEuroToken} exact />
    <Route path={walletRoutes.eth} component={DepositEth} exact />

    <Redirect to={parentRoutePath} />
  </Switch>
);