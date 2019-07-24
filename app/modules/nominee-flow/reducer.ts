import { AppReducer } from "../../store";
import { DeepReadonly } from "../../types";
import { actions } from "../actions";
import { etoFlowInitialState } from "../eto-flow/reducer";

export interface INomineeFlowState {
  loading: boolean;

}

export const nomineeFlowReducer: AppReducer<INomineeFlowState> = (
  state = etoFlowInitialState,
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
