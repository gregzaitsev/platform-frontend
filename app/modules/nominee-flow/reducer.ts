import { AppReducer } from "../../store";
import { DeepReadonly } from "../../types";
import { actions } from "../actions";

export enum ENomineeRequestStatus {
  PENDING = "pending",
  APPROVED = "approved",
  REJECTED = "rejected",
}

export enum ENomineeUpdateRequestStatus {
  APPROVED = "approved",
  REJECTED = "rejected",
}

export enum ENomineeRequestError {
  NONE = "none",
  ISSUER_ID_ERROR = "issuer_id_error",
  REQUEST_EXISTS = "REQUEST_EXISTS",
  GENERIC_ERROR = "nominee_request_generic_error",
}

export enum ENomineeAcceptThaStatus {
  NOT_DONE = "not_done",
  DONE = "done",
  ERROR = "error",
}

export enum ENomineeRedeemShareholderCapitalStatus {
  NOT_DONE = "not_done",
  DONE = "done",
  ERROR = "error",
}

export enum ENomineeLinkBankAccountStatus {
  NOT_DONE = "not_done",
  DONE = "done",
  ERROR = "error",
}

export enum ENomineeUploadIshaStatus {
  NOT_DONE = "not_done",
  DONE = "done",
  ERROR = "error",
}

export interface INomineeRequestMetadata {
  city: string;
  country: string;
  jurisdiction: string;
  legalForm: string;
  legalFormType: string;
  name: string;
  registrationNumber: string;
  street: string;
  zipCode: string;
}

export interface INomineeRequest {
  state: ENomineeRequestStatus;
  nomineeId: string;
  etoId: string;
  insertedAt: string;
  updatedAt: string;
  metadata: INomineeRequestMetadata;
}

export type TNomineeRequestStorage = { [id: string]: INomineeRequest }; //can be etoId or nomineeId

export interface INomineeFlowState {
  loading: boolean;
  error: ENomineeRequestError;
  nomineeRequests: TNomineeRequestStorage;
  linkBankAccount: ENomineeLinkBankAccountStatus;
  acceptTha: ENomineeAcceptThaStatus;
  redeemShareholderCapital: ENomineeRedeemShareholderCapitalStatus;
  uploadIsha: ENomineeUploadIshaStatus;
}

const nomineeFlowInitialState = {
  loading: false,
  error: ENomineeRequestError.NONE,
  nomineeRequests: {},
  acceptTha: ENomineeAcceptThaStatus.NOT_DONE,
  linkBankAccount: ENomineeLinkBankAccountStatus.NOT_DONE,
  redeemShareholderCapital: ENomineeRedeemShareholderCapitalStatus.NOT_DONE,
  uploadIsha: ENomineeUploadIshaStatus.NOT_DONE,
};

export const nomineeFlowReducer: AppReducer<INomineeFlowState> = (
  state = nomineeFlowInitialState,
  action,
): DeepReadonly<INomineeFlowState> => {
  switch (action.type) {
    case actions.nomineeFlow.createNomineeRequest.getType():
    case actions.nomineeFlow.loadNomineeTaskData.getType():
      return {
        ...state,
        loading: true,
      };
    case actions.nomineeFlow.storeNomineeTaskData.getType():
      return {
        ...state,
        loading: false,
        nomineeRequests: action.payload.tasks.nomineeRequests,
      };
    case actions.nomineeFlow.storeNomineeRequests.getType():
      return {
        ...state,
        loading: false,
        nomineeRequests: action.payload.nomineeRequests,
      };
    case actions.nomineeFlow.storeNomineeRequest.getType():
      return {
        ...state,
        nomineeRequests: {
          ...state.nomineeRequests,
          [action.payload.etoId]: action.payload.nomineeRequest,
        },
        error: ENomineeRequestError.NONE,
        loading: false,
      };
    case actions.nomineeFlow.loadingDone.getType():
      return {
        ...state,
        loading: false,
      };
    default:
      return state;
  }
};
