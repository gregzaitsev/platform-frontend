import BigNumber from "bignumber.js";
import * as React from "react";

import { MONEY_DECIMALS } from "../../../../config/constants";
import { subtractBankFee } from "../../../../utils/Number.utils";
import { MoneyNew } from "../../../shared/formatters/Money";
import {
  convertFromUlps,
  ECurrency,
  ENumberInputFormat,
  ENumberOutputFormat,
} from "../../../shared/formatters/utils";
import { getValidAmount } from "./utils";

const TotalRedeemed: React.FunctionComponent<{
  amount: string;
  bankFee: string;
  maxAmount?: string;
}> = ({ amount, bankFee, maxAmount }) => {
  const providedAmountUlps = maxAmount ? getValidAmount(amount, maxAmount) : amount;
  const bankFeeDec = convertFromUlps(new BigNumber(bankFee), MONEY_DECIMALS);

  return (
    <MoneyNew
      data-test-id="bank-transfer.redeem.total"
      value={subtractBankFee(providedAmountUlps, bankFeeDec)}
      inputFormat={ENumberInputFormat.FLOAT}
      valueType={ECurrency.EUR}
      outputFormat={ENumberOutputFormat.ONLY_NONZERO_DECIMALS}
    />
  );
};

export { TotalRedeemed };
