import BigNumber from "bignumber.js";

import { BANKING_AMOUNT_SCALE, MONEY_DECIMALS } from "../../../../config/constants";
import { compareBigNumbers } from "../../../../utils/BigNumberUtils";
import { convertToBigInt } from "../../../../utils/Number.utils";

export const getPossibleMaxUlps = (
  maxUlpsValue: string,
  providedDecimal: number | string,
  decimalPrecision = BANKING_AMOUNT_SCALE,
) => {
  const nEURBalance = new BigNumber(maxUlpsValue)
    .div(new BigNumber(10).pow(MONEY_DECIMALS))
    .toFixed(decimalPrecision, BigNumber.ROUND_DOWN);

  // Whole precision number should be passed when there is whole balance redeemed
  // also when user provided value has been used, then it have to be converted to Q18 via convertToBigInt
  return compareBigNumbers(providedDecimal, nEURBalance) === 0
    ? maxUlpsValue
    : convertToBigInt(providedDecimal);
};
