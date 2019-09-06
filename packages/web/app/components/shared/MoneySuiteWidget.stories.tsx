import { storiesOf } from "@storybook/react";
import * as React from "react";

import { ECurrency } from "./formatters/utils";
import {
  ESize,
  ETextPosition,
  ETheme,
  MoneySingleSuiteWidget,
  MoneySuiteWidget,
} from "./MoneySuiteWidget";

import * as neuIcon from "../../assets/img/neu_icon.svg";

storiesOf("Core|Molecules/MoneySuiteWidget", module)
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
  ))
  .add("with single value", () => (
    <MoneySingleSuiteWidget
      currency={ECurrency.NEU}
      value={"3050000000000000000"}
      theme={ETheme.BLACK}
      size={ESize.NORMAL}
      icon={neuIcon}
    />
  ));
