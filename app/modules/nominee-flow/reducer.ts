import { AppReducer } from "../../store";
import { DeepReadonly } from "../../types";
import { actions } from "../actions";

export enum ENomineeLinkRequestStatus {
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
  nomineeLinkRequestStatus: ENomineeLinkRequestStatus,
  acceptTha: ENomineeAcceptThaStatus,
  redeemShareholderCapital: ENomineeRedeemShareholderCapitalStatus,
  uploadIsha: ENomineeUploadIshaStatus
}

const nomineeFlowInitialState = {
  loading: false,
  nomineeLinkRequestStatus: ENomineeLinkRequestStatus.NONE,
  acceptTha: ENomineeAcceptThaStatus.NOT_DONE,
  redeemShareholderCapital: ENomineeRedeemShareholderCapitalStatus.NOT_DONE,
  uploadIsha: ENomineeUploadIshaStatus.NOT_DONE
};

export const nomineeFlowReducer: AppReducer<INomineeFlowState> = (
  state = nomineeFlowInitialState,
  action,
): DeepReadonly<INomineeFlowState> => {
  switch (action.type) {
    case actions.nomineeFlow.startNomineeTasksRequest.getType():
      return {
        ...state,
        loading: true,
      };
    case actions.nomineeFlow.setNomineeLinkRequestStatus.getType():
      return {
        ...state,
        nomineeLinkRequestStatus:action.payload.requestStatus,
        loading: false,
      };
    default:
      return state
  }
};
