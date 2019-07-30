import { AppReducer } from "../../store";
import { DeepReadonly } from "../../types";
import { actions } from "../actions";

interface IEtoNomineeState {}

const etoNomineeInitialState = {};

export const etoNomineeReducer: AppReducer<IEtoNomineeState> = (
  state = etoNomineeInitialState,
  action,
): DeepReadonly<IEtoNomineeState> => {
  switch (action.type) {
    case actions.etoNominee.setNomineeRequests.getType():
      return {};
    default:
      return state
  }
};
