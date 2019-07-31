import { AppReducer } from "../../store";
import { DeepReadonly } from "../../types";
import { actions } from "../actions";
import { TNomineeRequestStorage } from "../nominee-flow/reducer";

export interface IEtoNomineeState {
  isLoading: boolean;
  nomineeRequests: TNomineeRequestStorage
}

const etoNomineeInitialState:IEtoNomineeState = {
  isLoading: false,
  nomineeRequests: {}
};

export const etoNomineeReducer: AppReducer<IEtoNomineeState> = (
  state = etoNomineeInitialState,
  action,
): DeepReadonly<IEtoNomineeState> => {
  switch (action.type) {
    case actions.etoNominee.getNomineeRequests.getType():
      console.log("reducer actions.etoNominee.getNomineeRequests")
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
