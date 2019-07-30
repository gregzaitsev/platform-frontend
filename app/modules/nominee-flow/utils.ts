import { createMessage, TMessage } from "../../components/translatedMessages/utils";
import { ENomineeRequestStatus } from "./reducer";
import { ENomineeLinkRequestStatusTranslation } from "../../components/translatedMessages/messages";
import { TNomineeRequestResponse } from "../../lib/api/eto/EtoApi.interfaces.unsafe";

export const linkRequestToTranslationMessage = (status: ENomineeRequestStatus): TMessage => {
  switch (status) {
    case ENomineeRequestStatus.APPROVED:
      return createMessage(ENomineeLinkRequestStatusTranslation.APPROVED);
    case ENomineeRequestStatus.GENERIC_ERROR:
      return createMessage(ENomineeLinkRequestStatusTranslation.GENERIC_ERROR);
    case ENomineeRequestStatus.ISSUER_ID_ERROR:
      return createMessage(ENomineeLinkRequestStatusTranslation.ISSUER_ID_ERROR);
    case ENomineeRequestStatus.NONE:
      return createMessage(ENomineeLinkRequestStatusTranslation.NONE);
    case ENomineeRequestStatus.PENDING:
      return createMessage(ENomineeLinkRequestStatusTranslation.PENDING);
    case ENomineeRequestStatus.REJECTED:
      return createMessage(ENomineeLinkRequestStatusTranslation.REJECTED);
    case ENomineeRequestStatus.REQUEST_EXISTS:
      return createMessage(ENomineeLinkRequestStatusTranslation.REQUEST_EXISTS);
  }
};


export const takeLatestNomineeRequest = (nomineeRequestStatus:TNomineeRequestResponse[]) =>
  nomineeRequestStatus.reduce((acc: TNomineeRequestResponse | undefined, reqStatus: TNomineeRequestResponse) => {
  const date = new Date(reqStatus.updatedAt === null ? reqStatus.insertedAt : reqStatus.updatedAt)
  const accDate = acc && new Date(acc.updatedAt === null ? acc.insertedAt : acc.updatedAt)
  if (!accDate || accDate < date) {
    return reqStatus
  } else {
    return acc
  }
}, undefined)
