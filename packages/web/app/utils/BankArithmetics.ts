import BigNumber from "bignumber.js";

import {
  ENumberInputFormat,
  ERoundingMode,
  toFixedPrecision,
} from "../components/shared/formatters/utils";
import { BANKING_AMOUNT_SCALE, ISO2022_AMOUNT_SCALE } from "../config/constants";
import { multiplyBigNumbers, subtractBigNumbers } from "./BigNumberUtils";

export const iso2002Quantize = (value: number | BigNumber | string): string => {
  const valueBn = value instanceof BigNumber ? value : new BigNumber(value);

  if (valueBn.isZero()) {
    return "0";
  }

  return toFixedPrecision({
    value: valueBn,
    decimalPlaces: ISO2022_AMOUNT_SCALE,
    roundingMode: ERoundingMode.HALF_UP,
    inputFormat: ENumberInputFormat.FLOAT,
  });
};

export const bankQuantize = (value: number | BigNumber | string): string => {
  const valueBn = value instanceof BigNumber ? value : new BigNumber(value);

  if (valueBn.isZero()) {
    return "0";
  }

  return toFixedPrecision({
    value: valueBn,
    decimalPlaces: BANKING_AMOUNT_SCALE,
    roundingMode: ERoundingMode.DOWN,
    inputFormat: ENumberInputFormat.FLOAT,
  });
};

export const subtractBankFee = (
  amount: number | BigNumber | string,
  feeFraction: number | BigNumber | string,
): string => {
  if (Number(feeFraction) > 1 || isNaN(Number(feeFraction))) {
    throw new Error("FeeFraction must be fraction number");
  }

  const iso2002Amount = iso2002Quantize(amount);
  const feeBn = multiplyBigNumbers([iso2002Amount, feeFraction]);
  const totalBn = subtractBigNumbers([iso2002Amount, feeBn]);
  return bankQuantize(totalBn);
};

export const calculateBankFee = (
  amount: number | BigNumber | string,
  feeFraction: number | BigNumber | string,
): string => {
  const totalDec = subtractBankFee(amount, feeFraction);
  return subtractBigNumbers([amount, totalDec]);
};
