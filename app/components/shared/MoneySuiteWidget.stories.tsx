import { storiesOf } from "@storybook/react";
import * as React from "react";

import { ECurrency } from "./formatters/utils";
import { ETextPosition, ETheme, MoneySuiteWidget } from "./MoneySuiteWidget";
import { ESize } from "./TransactionData";

import * as neuIcon from "../../assets/img/neu_icon.svg";

storiesOf("Core|Molecules/MoneySuiteWidget", module)
  .add("default", () => (
    <MoneySuiteWidget
      currency={ECurrency.NEU}
      largeNumber={"1100000000000000000"}
      value={"3050000000000000000"}
      currencyTotal={ECurrency.EUR}
      theme={ETheme.BLACK}
      size={ESize.NORMAL}
    />
  ))
  .add("with icon", () => (
    <MoneySuiteWidget
      currency={ECurrency.NEU}
      largeNumber={"1100000000000000000"}
      value={"3050000000000000000"}
      currencyTotal={ECurrency.EUR}
      theme={ETheme.BLACK}
      size={ESize.NORMAL}
      icon={neuIcon}
    />
  ))
  .add("aligned to right", () => (
    <MoneySuiteWidget
      textPosition={ETextPosition.RIGHT}
      currency={ECurrency.NEU}
      largeNumber={"1100000000000000000"}
      value={"3050000000000000000"}
      currencyTotal={ECurrency.EUR}
      theme={ETheme.BLACK}
      size={ESize.NORMAL}
      icon={neuIcon}
    />
  ))
  .add("with icon and wallet name", () => (
    <MoneySuiteWidget
      currency={ECurrency.NEU}
      largeNumber={"1100000000000000000"}
      value={"3050000000000000000"}
      currencyTotal={ECurrency.EUR}
      theme={ETheme.BLACK}
      size={ESize.NORMAL}
      walletName={"NEU Balance"}
      icon={neuIcon}
    />
  ));
