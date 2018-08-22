import { storiesOf } from "@storybook/react";
import { Formik } from "formik";
import * as React from "react";

import { EInvestmentType } from "../../../../modules/investmentFlowModal/reducer";
import { InvestmentSelectionForm } from "./Investment";

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

storiesOf("InvestmentSelectionForm", module).add("default", () => (
  <Formik initialValues={{ wallet: "bar", amount: 0 }} onSubmit={() => {}}>
    {(props: any) => <InvestmentSelectionForm {...props} wallets={wallets} />}
  </Formik>
));
