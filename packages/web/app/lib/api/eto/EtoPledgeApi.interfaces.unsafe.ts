import * as Yup from "yup";

import {
  ECurrency,
  stripNumberFormatting,
  parseInputToNumber,
} from "../../../components/shared/formatters/utils";
import {
  getMessageTranslation,
  ValidationMessage,
} from "../../../components/translatedMessages/messages";
import { createMessage } from "../../../components/translatedMessages/utils";

export interface IPledge {
  amountEur: number;
  currency: ECurrency.EUR_TOKEN;
  consentToRevealEmail: boolean;
}

export interface IBookBuildingStats {
  investorsCount: number;
  pledgedAmount: number;
}

export const generateCampaigningValidation = (minPledge: number, maxPledge?: number) =>
  Yup.object({
    amount: Yup.string()
      .required()
      .matches(/^[0-9]*$/, "Must be a number")
      // .typeError(getMessageTranslation(createMessage(ValidationMessage.VALIDATION_INTEGER)))
      .test(
        "minAmount",
        getMessageTranslation(createMessage(ValidationMessage.VALIDATION_MIN_PLEDGE, minPledge)),
        (test: string) => !!(parseInt(test, 10) >= minPledge),
      )
      .test(
        "maxAmount",
        getMessageTranslation(createMessage(ValidationMessage.VALIDATION_MAX_PLEDGE, maxPledge)),
        (test: string) => !!(parseInt(test, 10) <= (maxPledge || Infinity)),
      ),
  });
