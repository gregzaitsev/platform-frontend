import { createMessage, TMessage } from "../../components/translatedMessages/utils";
import { ENomineeRequestStatus, INomineeRequest, TNomineeRequestStorage } from "./reducer";
import { ENomineeLinkRequestStatusTranslation } from "../../components/translatedMessages/messages";
import { TNomineeRequestResponse } from "../../lib/api/eto/EtoApi.interfaces.unsafe";

export const nomineeRequestToTranslationMessage = (status: ENomineeRequestStatus): TMessage => {
  switch (status) {
    case ENomineeRequestStatus.APPROVED:
      return createMessage(ENomineeLinkRequestStatusTranslation.APPROVED);
    case ENomineeRequestStatus.PENDING:
      return createMessage(ENomineeLinkRequestStatusTranslation.PENDING);
    case ENomineeRequestStatus.REJECTED:
      return createMessage(ENomineeLinkRequestStatusTranslation.REJECTED);
  }
};

export const takeLatestNomineeRequest = (nomineeRequests: TNomineeRequestStorage) =>
  Object.keys(nomineeRequests).reduce((acc: INomineeRequest | undefined, etoId: string) => {
    const request = nomineeRequests[etoId];
    const date = new Date(request.updatedAt === null ? request.insertedAt : request.updatedAt);
    const accDate = acc && new Date(acc.updatedAt === null ? acc.insertedAt : acc.updatedAt);
    if (!accDate || accDate < date) {
      return request
    } else {
      return acc
    }
  }, undefined);

export const apiDataToNomineeRequests = (requests:TNomineeRequestResponse[]) => requests.reduce((acc:TNomineeRequestStorage,request:TNomineeRequestResponse) => {
  acc[request.etoId] = nomineeRequestResponseToRequestStatus(request);
  return acc
},{});

export const nomineeRequestResponseToRequestStatus = (response: TNomineeRequestResponse):INomineeRequest => {
  switch (response.state) {
    case "pending":
      return {...response, state: ENomineeRequestStatus.PENDING};
    case "approved":
      return {...response, state: ENomineeRequestStatus.APPROVED};
    case "rejected":
      return {...response, state: ENomineeRequestStatus.REJECTED};
    default:
      throw new Error("invalid response")
  }
};
