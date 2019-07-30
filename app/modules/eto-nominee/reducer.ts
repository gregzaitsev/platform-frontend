import { AppReducer } from "../../store";
import { DeepReadonly } from "../../types";
import { actions } from "../actions";

export interface IEtoNomineeState {
  isLoading: boolean;
  nomineeRequests: IEtoNomineeRequest[]
}

export interface IEtoNomineeRequest {}

const etoNomineeInitialState:IEtoNomineeState = {
  isLoading: false,
  nomineeRequests: []
};

export const etoNomineeReducer: AppReducer<IEtoNomineeState> = (
  state = etoNomineeInitialState,
  action,
): DeepReadonly<IEtoNomineeState> => {
  switch (action.type) {
    case actions.etoNominee.getNomineeRequests.getType():
      return {
        ...state,
        isLoading:true
      };
    case actions.etoNominee.storeNomineeRequests.getType():
      return {
        ...state,
        nomineeRequests: action.payload.requests,
        isLoading:false
      };
    default:
      return state
  }
};
