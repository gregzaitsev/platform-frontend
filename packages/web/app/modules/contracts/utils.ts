import BigNumber from "bignumber.js";
import { mapValues } from "lodash";

export function numericValuesToString<T extends Record<keyof T, string | BigNumber>>(
  entity: T,
): Record<keyof T, string> {
  return mapValues<T, string>(entity, e => e.toString());
}
