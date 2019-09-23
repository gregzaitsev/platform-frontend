import BigNumber from "bignumber.js";
import { TestContext, TestOptions } from "yup";

import { isValidNumber } from "../../components/shared/formatters/utils";
import {
  getMessageTranslation,
  ValidationMessage,
} from "../../components/translatedMessages/messages";
import { createMessage } from "../../components/translatedMessages/utils";

export const isPledgeAboveMinimum = (minPledge: number): TestOptions => ({
  name: "minAmount",
  message: getMessageTranslation(
    createMessage(ValidationMessage.VALIDATION_MIN_PLEDGE, minPledge),
  ) as string,
  test: function(this: TestContext, value: string): boolean {
    return isValidNumber(value) && new BigNumber(value).greaterThanOrEqualTo(minPledge.toString());
  },
});

export const isPledgeNotAboveMaximum = (maxPledge?: number): TestOptions => ({
  name: "minAmount",
  message: getMessageTranslation(
    createMessage(ValidationMessage.VALIDATION_MAX_PLEDGE, maxPledge),
  ) as string,
  test: function(this: TestContext, value: string): boolean {
    return (
      isValidNumber(value) &&
      new BigNumber(value).lessThanOrEqualTo(maxPledge ? maxPledge.toString() : Infinity)
    );
  },
});
