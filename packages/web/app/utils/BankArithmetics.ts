import BigNumber from "bignumber.js";

import { toFixedBankingPrecision } from "../components/modals/tx-sender/redeem/utils";
import {
  ENumberInputFormat,
  ERoundingMode,
  toFixedPrecision,
} from "../components/shared/formatters/utils";
import { BANKING_AMOUNT_SCALE, ISO2022_AMOUNT_SCALE } from "../config/constants";
import { multiplyBigNumbers, subtractBigNumbers } from "./BigNumberUtils";
import { convertToBigInt } from "./Number.utils";

export const iso2002Quantize = (
  value: number | BigNumber | string,
  inputFormat: ENumberInputFormat,
): string => {
  const valueBn = value instanceof BigNumber ? value : new BigNumber(value);

  if (valueBn.isZero()) {
    return "0";
  }

  return toFixedPrecision({
    value: valueBn,
    decimalPlaces: ISO2022_AMOUNT_SCALE,
    roundingMode: ERoundingMode.HALF_UP,
    inputFormat: inputFormat,
  });
};

export const bankQuantize = (
  value: number | BigNumber | string,
  inputFormat: ENumberInputFormat,
): string => {
  const valueBn = value instanceof BigNumber ? value : new BigNumber(value);

  if (valueBn.isZero()) {
    return "0";
  }

  return toFixedBankingPrecision(valueBn, inputFormat);
};

export const subtractBankFee = (
  amount: number | BigNumber | string,
  feeFraction: number | BigNumber | string,
  inputFormat: ENumberInputFormat,
): string => {
  if (inputFormat === ENumberInputFormat.FLOAT) {
    if (Number(feeFraction) > 1 || isNaN(Number(feeFraction))) {
      throw new Error("FeeFraction must be fraction number");
    }
  } else {
    if (new BigNumber(feeFraction).comparedTo(convertToBigInt(1)) === 1) {
      throw new Error("FeeFraction must be fraction number");
    }
  }

  const fee =
    inputFormat === ENumberInputFormat.ULPS
      ? toFixedPrecision({
          value: feeFraction,
          decimalPlaces: ISO2022_AMOUNT_SCALE,
        })
      : feeFraction;

  const iso2002Amount = iso2002Quantize(amount, inputFormat);
  const feeBn = multiplyBigNumbers([iso2002Amount, fee]);
  const totalBn = subtractBigNumbers([iso2002Amount, feeBn]);

  // Calculation result is always FLOAT
  return bankQuantize(totalBn, ENumberInputFormat.FLOAT);
};

export const calculateBankFee = (
  amount: number | BigNumber | string,
  feeFraction: number | BigNumber | string,
  inputFormat: ENumberInputFormat,
): string => {
  const amountVal =
    inputFormat === ENumberInputFormat.ULPS
      ? toFixedPrecision({
          value: amount,
          decimalPlaces: BANKING_AMOUNT_SCALE,
        })
      : amount;

  const totalDec = subtractBankFee(amount, feeFraction, inputFormat);
  return subtractBigNumbers([amountVal, totalDec]);
};
