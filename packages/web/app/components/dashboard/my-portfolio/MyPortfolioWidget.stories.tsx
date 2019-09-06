import { storiesOf } from "@storybook/react";
import * as React from "react";

import { Q18 } from "../../../config/constants";
import { MyPortfolioWidgetComponent } from "./MyPortfolioWidget";

storiesOf("MyPortfolioWidget", module)
  .add("loading", () => (
    <MyPortfolioWidgetComponent
      isLoading
      isIncomingPayoutLoading
      isIncomingPayoutAvailable={false}
    />
  ))
  .add("loaded", () => (
    <MyPortfolioWidgetComponent
      isLoading={false}
      isIncomingPayoutLoading={false}
      isIncomingPayoutAvailable={false}
      {...{
        balanceEur: "12312352413",
        balanceNeu: Q18.mul(123).toString(),
        isIcbmWalletConnected: true,
      }}
    />
  ))
  .add("loaded, no funds", () => (
    <MyPortfolioWidgetComponent
      isLoading={false}
      isIncomingPayoutLoading={false}
      isIncomingPayoutAvailable={false}
      {...{ balanceEur: "0", balanceNeu: "0", isIcbmWalletConnected: true }}
    />
  ))
  .add("error", () => (
    <MyPortfolioWidgetComponent
      isLoading={false}
      isIncomingPayoutLoading={false}
      isIncomingPayoutAvailable={false}
      error={"bla bla error"}
      {...{ balanceEur: "0", balanceNeu: "0", isIcbmWalletConnected: true }}
    />
  ));
