import { AppReducer } from "../../store";
import { DeepReadonly } from "../../types";
import { actions } from "../actions";

export enum ENomineeRequestStatus {
  NONE = "none",
  PENDING = "pending",
  APPROVED = "approved",
  REJECTED = "rejected",
  ISSUER_ID_ERROR = "issuer_id_error",
  REQUEST_EXISTS = "REQUEST_EXISTS",
  GENERIC_ERROR = "nominee_request_generic_error"
}

export enum ENomineeAcceptThaStatus {
  NOT_DONE = "not_done",
  DONE = "done",
  ERROR = "error"
}

export enum ENomineeRedeemShareholderCapitalStatus {
  NOT_DONE = "not_done",
  DONE = "done",
  ERROR = "error"
}

export enum ENomineeUploadIshaStatus {
  NOT_DONE = "not_done",
  DONE = "done",
  ERROR = "error"
}

export interface INomineeFlowState {
  loading: boolean;
  nomineeRequestStatus: ENomineeRequestStatus,
  acceptTha: ENomineeAcceptThaStatus,
  redeemShareholderCapital: ENomineeRedeemShareholderCapitalStatus,
  uploadIsha: ENomineeUploadIshaStatus
}

const nomineeFlowInitialState = {
  loading: false,
  nomineeRequestStatus: ENomineeRequestStatus.NONE,
  acceptTha: ENomineeAcceptThaStatus.NOT_DONE,
  redeemShareholderCapital: ENomineeRedeemShareholderCapitalStatus.NOT_DONE,
  uploadIsha: ENomineeUploadIshaStatus.NOT_DONE
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
    case actions.nomineeFlow.setNomineeRequestStatus.getType():
      return {
        ...state,
        nomineeRequestStatus:action.payload.requestStatus,
        loading: false,
      };
    default:
      return state
  }
};
