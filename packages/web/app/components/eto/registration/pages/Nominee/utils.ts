import { INomineeRequest } from "../../../../../modules/nominee-flow/reducer";

export const nomineeRequestsAreEmpty = (nomineeRequests: INomineeRequest[]): boolean =>
  Object.keys(nomineeRequests).length === 0;
