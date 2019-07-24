import { AppReducer } from "../../store";
import { DeepReadonly } from "../../types";
import { actions } from "../actions";

export enum ENomineeConnectRequestStatus {
  NONE = "none",
  PENDING = "pending",
  APPROVED = "approved",
  REJECTED = "rejected",
  ERROR = "error"
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
  issuerConnectRequest: ENomineeConnectRequestStatus,
  acceptTha: ENomineeAcceptThaStatus,
  redeemShareholderCapital: ENomineeRedeemShareholderCapitalStatus,
  uploadIsha: ENomineeUploadIshaStatus
}

const nomineeFlowInitialState = {
  loading: false,
  issuerConnectRequest: ENomineeConnectRequestStatus.NONE,
  acceptTha: ENomineeAcceptThaStatus.NOT_DONE,
  redeemShareholderCapital: ENomineeRedeemShareholderCapitalStatus.NOT_DONE,
  uploadIsha: ENomineeUploadIshaStatus.NOT_DONE
};

export const nomineeFlowReducer: AppReducer<INomineeFlowState> = (
  state = nomineeFlowInitialState,
  action,
): DeepReadonly<INomineeFlowState> => {
  switch (action.type) {
    case actions.nomineeFlow.startNomineeTaskRequest.getType():
      return {
        ...state,
        loading: true,
      };
    case actions.nomineeFlow.setNomineeTaskStatus.getType():
      return {
        ...state,
        loading: false,
      };
    default:
      return state
  }
};
