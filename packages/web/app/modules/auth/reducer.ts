import { IUser } from "../../lib/api/users/interfaces";
import { AppReducer } from "../../store";
import { DeepReadonly } from "../../types";
import { actions } from "../actions";

export interface IAuthState {
  user?: IUser;
  jwt?: string;
  currentAgreementHash?: string;
}

const authInitialState: IAuthState = {};

export const authReducer: AppReducer<IAuthState> = (
  state = authInitialState,
  action,
): DeepReadonly<IAuthState> => {
  switch (action.type) {
    case actions.auth.setUser.getType():
      return {
        ...state,
        user: action.payload.user,
      };
    case actions.auth.loadJWT.getType():
      return {
        ...state,
        jwt: action.payload.jwt,
      };
    case "SET_CURRENT_AGREEMENT_HASH":
      return {
        ...state,
        currentAgreementHash: action.payload.currentAgreementHash,
      };
    //Log out is done on whole state instead of just AUTH reducer
  }

  return state;
};
