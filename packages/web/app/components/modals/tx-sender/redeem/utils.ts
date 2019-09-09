import BigNumber from "bignumber.js";

import { MONEY_DECIMALS } from "../../../../config/constants";
import { getPossibleMaxUlps } from "../../../../utils/Number.utils";
import { convertFromUlps, isEmptyValue, isValidNumber } from "../../../shared/formatters/utils";

export const getValidAmount = (amount: string, maxAmount: string): BigNumber => {
  if (!isValidNumber(amount) || (isEmptyValue(amount) && 0)) {
    return new BigNumber(0);
  }

  const amountUlps = getPossibleMaxUlps(maxAmount, amount, 2);

  return convertFromUlps(new BigNumber(amountUlps), MONEY_DECIMALS);
};
