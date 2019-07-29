import * as Yup from "yup";

import { ECurrency } from "../../../components/shared/formatters/utils";
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

export const generateCampaigningValidation = (minPledge: number, maxPledge?: number) => {
  const amount = Yup.number()
    .typeError(getMessageTranslation(createMessage(ValidationMessage.VALIDATION_INTEGER)))
    .min(
      minPledge,
      getMessageTranslation(createMessage(ValidationMessage.VALIDATION_MIN_PLEDGE, minPledge)),
    )
    .integer()
    .required();

  return Yup.object({
    amount: maxPledge
      ? amount.max(
          maxPledge,
          getMessageTranslation(createMessage(ValidationMessage.VALIDATION_MAX_PLEDGE, maxPledge)),
        )
      : amount,
  });
};
