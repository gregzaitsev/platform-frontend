import BigNumber from "bignumber.js";
import { TestContext, TestOptions } from "yup";

import { isValidNumber } from "../../components/shared/formatters/utils";
import {
  getMessageTranslation,
  ValidationMessage,
} from "../../components/translatedMessages/messages";
import { createMessage } from "../../components/translatedMessages/utils";

export enum EWhitelistingState {
  ACTIVE = "active",
  NOT_ACTIVE = "notActive",
  LIMIT_REACHED = "limitReached",
  SUSPENDED = "suspended",
  STOPPED = "stopped",
}

type TcalculateWhitelistingState = {
  canEnableBookbuilding: boolean;
  whitelistingIsActive: boolean;
  bookbuildingLimitReached: boolean;
  investorsCount: number;
};

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

export const calculateWhitelistingState = ({
  canEnableBookbuilding,
  whitelistingIsActive,
  bookbuildingLimitReached,
  investorsCount,
}: TcalculateWhitelistingState) => {
  //TODO this should be put in line with api after API's canEnableBookbuilding after limit is reached gets fixed by Marcin
  if (whitelistingIsActive) {
    return EWhitelistingState.ACTIVE;
  } else if (!whitelistingIsActive && !canEnableBookbuilding && investorsCount > 0) {
    return EWhitelistingState.STOPPED;
  } else if (!whitelistingIsActive && !canEnableBookbuilding && investorsCount === 0) {
    return EWhitelistingState.NOT_ACTIVE;
  } else if (bookbuildingLimitReached) {
    return EWhitelistingState.LIMIT_REACHED;
  } else if (
    !whitelistingIsActive &&
    canEnableBookbuilding &&
    investorsCount &&
    !bookbuildingLimitReached
  ) {
    return EWhitelistingState.SUSPENDED;
  } else {
    return EWhitelistingState.NOT_ACTIVE;
  }
};
