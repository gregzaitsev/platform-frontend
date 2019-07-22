import { storiesOf } from "@storybook/react";
import * as React from "react";

import { ESize, TransactionData } from "./TransactionData";

storiesOf("Atoms|TransactionData", module)
  .add("default", () => <TransactionData bottom="Claim Tx Transaction" top="today" />)
  .add("size medium", () => (
    <TransactionData bottom="Claim Tx Transaction" top="today" size={ESize.MEDIUM} />
  ))
  .add("size large", () => (
    <TransactionData bottom="Claim Tx Transaction" top="today" size={ESize.LARGE} />
  ));
