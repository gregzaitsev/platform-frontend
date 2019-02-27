import * as cn from "classnames";
import * as React from "react";

import { KycBankVerifiedBankAccount } from "../../lib/api/KycApi.interfaces";

import * as bankIcon from "../../assets/img/bank-transfer/bank_icon.svg";
import * as styles from "./BankAccount.module.scss";

interface IExternalProps {
  details: KycBankVerifiedBankAccount;
  withBorder?: boolean;
}

interface IBankNumber {
  last4: string;
  bank: string;
}

const BankNumber: React.FunctionComponent<IBankNumber> = ({ last4, bank }) => (
  <>
    {bank} ({"*".repeat(16)}
    {last4})
  </>
);

const BankAccount: React.FunctionComponent<IExternalProps> = ({ details, withBorder }) => (
  <section className={cn(styles.bankDetails, { [styles.framed]: withBorder })}>
    <img className={styles.icon} src={bankIcon} alt="" />
    <div>
      <p className={cn(styles.kycData, "m-0")}>{details.name}</p>
      <p className={"m-0"}>
        <BankNumber last4={details.bankAccountNumberLast4} bank={details.bankName} />
      </p>
    </div>
  </section>
);

export { BankAccount, BankNumber };
