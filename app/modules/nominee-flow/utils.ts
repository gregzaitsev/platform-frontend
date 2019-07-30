import { createMessage, TMessage } from "../../components/translatedMessages/utils";
import { ENomineeLinkRequestStatus } from "./reducer";
import { ENomineeLinkRequestStatusTranslation } from "../../components/translatedMessages/messages";

export const linkRequestToTranslationMessage = (status: ENomineeLinkRequestStatus): TMessage => {
  switch (status) {
    case ENomineeLinkRequestStatus.APPROVED:
      return createMessage(ENomineeLinkRequestStatusTranslation.APPROVED);
    case ENomineeLinkRequestStatus.GENERIC_ERROR:
      return createMessage(ENomineeLinkRequestStatusTranslation.GENERIC_ERROR);
    case ENomineeLinkRequestStatus.ISSUER_ID_ERROR:
      return createMessage(ENomineeLinkRequestStatusTranslation.ISSUER_ID_ERROR);
    case ENomineeLinkRequestStatus.NONE:
      return createMessage(ENomineeLinkRequestStatusTranslation.NONE);
    case ENomineeLinkRequestStatus.PENDING:
      return createMessage(ENomineeLinkRequestStatusTranslation.PENDING);
    case ENomineeLinkRequestStatus.REJECTED:
      return createMessage(ENomineeLinkRequestStatusTranslation.REJECTED);
    case ENomineeLinkRequestStatus.REQUEST_EXISTS:
      return createMessage(ENomineeLinkRequestStatusTranslation.REQUEST_EXISTS);
  }
};
