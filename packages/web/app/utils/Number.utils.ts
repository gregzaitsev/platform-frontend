import BigNumber from "bignumber.js";
import { curry } from "lodash/fp";

import {
  DEFAULT_DECIMAL_PLACES,
  DISPLAY_AMOUNT_SCALE,
  ISO2022_AMOUNT_SCALE,
  MONEY_DECIMALS,
  Q18,
} from "../config/constants";
import { TBigNumberVariant } from "../lib/web3/types";
import { compareBigNumbers, multiplyBigNumbers, subtractBigNumbers } from "./BigNumberUtils";

export function isZero(value: string): boolean {
  const bigNumberValue = new BigNumber(value);

  return bigNumberValue.isZero();
}

export function convertToBigInt(value: TBigNumberVariant, currencyDecimals?: number): string {
  const q = currencyDecimals ? new BigNumber(10).pow(currencyDecimals) : Q18;
  const moneyInWei = q.mul(value);
  return moneyInWei.toFixed(0, BigNumber.ROUND_UP);
}
/*
 * @deprecated
 * */
export function formatFlexiPrecision(
  value: number | string,
  maxPrecision: number,
  minPrecision = 0,
  useGrouping = false,
): string {
  return parseFloat(value as string).toLocaleString(undefined, {
    maximumFractionDigits: maxPrecision,
    minimumFractionDigits: minPrecision,
    useGrouping,
  });
}

type TNormalizeOptions = { min: number; max: number };

function normalizeValue(options: TNormalizeOptions, value: number): number {
  const minAllowed = 0;
  const maxAllowed = 1;

  return (
    ((maxAllowed - minAllowed) * (value - options.min)) / (options.max - options.min) + minAllowed
  );
}

export const normalize = curry(normalizeValue);

export const iso2002Quantize = (value: number | BigNumber | string): string => {
  const valueBn = value instanceof BigNumber ? value : new BigNumber(value);

  if (valueBn.isZero()) {
    return "0";
  }

  return valueBn.toFixed(ISO2022_AMOUNT_SCALE, BigNumber.ROUND_HALF_UP);
};

export const bankQuantize = (value: number | BigNumber | string): string => {
  const valueBn = value instanceof BigNumber ? value : new BigNumber(value);

  if (valueBn.isZero()) {
    return "0";
  }

  return valueBn.toFixed(DISPLAY_AMOUNT_SCALE, BigNumber.ROUND_DOWN);
};

export const getPossibleMaxUlps = (
  maxUlpsValue: string,
  providedDecimal: number | string,
  decimalPrecision = DEFAULT_DECIMAL_PLACES,
) => {
  //1.02781271988e+25

  const nEURBalance = new BigNumber(maxUlpsValue)
    .div(new BigNumber(10).pow(MONEY_DECIMALS))
    .toFixed(decimalPrecision, BigNumber.ROUND_DOWN);

  // Whole precision number should be passed when there is whole balance redeemed
  // also when user provided value has been used, then it have to be converted to Q18 via convertToBigInt
  return compareBigNumbers(providedDecimal, nEURBalance) === 0
    ? maxUlpsValue
    : convertToBigInt(providedDecimal);
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

export const calculateFee = (
  amount: number | BigNumber | string,
  feeFraction: number | BigNumber | string,
): string => {
  const totalDec = subtractBankFee(amount, feeFraction);
  return subtractBigNumbers([amount, totalDec]);
};
