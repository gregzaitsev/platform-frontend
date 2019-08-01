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


export const nomineeApiDataToNomineeRequests = (requests: TNomineeRequestResponse[]) =>
  requests.reduce((acc: TNomineeRequestStorage, request: TNomineeRequestResponse) => {
    acc[request.etoId] = nomineeRequestResponseToRequestStatus(request);
    return acc
  }, {});


export const etoApiDataToNomineeRequests = (requests: TNomineeRequestResponse[]) =>
  requests.reduce((acc: TNomineeRequestStorage, request: TNomineeRequestResponse) => {
    acc[request.nomineeId] = nomineeRequestResponseToRequestStatus(request);
    return acc
  }, {});

export const nomineeRequestResponseToRequestStatus = (response: TNomineeRequestResponse): INomineeRequest => {
  switch (response.state) {
    case "pending":
      return { ...response, state: ENomineeRequestStatus.PENDING };
    case "approved":
      return { ...response, state: ENomineeRequestStatus.APPROVED };
    case "rejected":
      return { ...response, state: ENomineeRequestStatus.REJECTED };
    default:
      throw new Error("invalid response")
  }
};

const compareByDate = (a: INomineeRequest, b: INomineeRequest) => {
  const dateA = new Date(a.updatedAt === null ? a.insertedAt : a.updatedAt);
  const dateB = new Date(b.updatedAt === null ? b.insertedAt : b.updatedAt);
  if (dateA === dateB) {
    return 0
  } else {
    return dateA > dateB ? -1 : 1
  }
};

export const nomineeRequestsToArray = (requests: TNomineeRequestStorage): INomineeRequest[] => {
  const requestsArray = Object.keys(requests).reduce((acc: INomineeRequest[], etoId: string) => {
    acc.push(requests[etoId]);
    return acc
  }, []);

  return requestsArray.filter((request: INomineeRequest) => request.state === ENomineeRequestStatus.PENDING).sort(compareByDate)
};
