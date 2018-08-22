import { storiesOf } from "@storybook/react";
import * as React from "react";
import { Container } from "reactstrap";

import { EInvestmentType } from "../../../../modules/investmentFlowModal/reducer";
import { InvestmentTypeSelector } from "./InvestmentTypeSelector";

import * as ethIcon from "../../../../assets/img/eth_icon2.svg";
import * as euroIcon from "../../../../assets/img/euro_icon.svg";
import * as neuroIcon from "../../../../assets/img/neuro_icon.svg";

const wallets = [
  {
    balanceEth: "30000000000000000000",
    type: EInvestmentType.ICBMEth,
    name: "ICBM Wallet",
    icon: ethIcon
  },
  {
    balanceNEuro: "45600000000000000000",
    balanceEur: "45600000000000000000",
    type: EInvestmentType.ICBMnEuro,
    name: "ICBM Wallet",
    icon: neuroIcon
  },
  {
    balanceEth: "50000000000000000000",
    balanceEur: "45600000000000000000",
    type: EInvestmentType.InvestmentWallet,
    name: "Investment Wallet",
    icon: ethIcon
  },
  {
    type: EInvestmentType.BankTransfer,
    name: "Direct Bank Transfer",
    icon: euroIcon
  },
];

// tslint:disable-next-line:no-console
const onSelect = (v: any) => console.log(v)

storiesOf("InvestmentTypeSelector", module).add("default", () => (
  <Container>
    <InvestmentTypeSelector wallets={wallets} currentType={EInvestmentType.None} onSelect={onSelect} />
  </Container>
));

storiesOf("InvestmentTypeSelector", module).add("selected", () => (
  <Container>
    <InvestmentTypeSelector wallets={wallets} currentType={EInvestmentType.InvestmentWallet} onSelect={onSelect} />
  </Container>
));
