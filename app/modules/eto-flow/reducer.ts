import { AppReducer } from "../../store";
import { DeepReadonly } from "../../types";
import { actions } from "../actions";
import { IEtoFlowState } from "./types";

export const etoFlowInitialState: IEtoFlowState = {
  eto: undefined,
  company: undefined,
  products: undefined,
  loading: false,
  saving: false,
  bookbuildingStats: [],
  signedInvestmentAgreementUrlLoading: false,
  signedInvestmentAgreementUrl: null,
  etoDateSaving: false,
};

export const etoFlowReducer: AppReducer<IEtoFlowState> = (
  state = etoFlowInitialState,
  action,
): DeepReadonly<IEtoFlowState> => {
  switch (action.type) {
    case actions.etoFlow.loadIssuerEto.getType():
      return {
        ...state,
        loading: !action.payload.inBackground ? true : state.loading,
      };
    case actions.etoFlow.setEto.getType():
      return {
        ...state,
        eto: action.payload.eto,
        company: action.payload.company || state.company,
        loading: false,
        saving: false,
      };
    case actions.etoFlow.loadDataStop.getType():
      return {
        ...state,
        loading: false,
        saving: false,
      };
    case actions.etoFlow.saveDataStart.getType():
    case actions.etoFlow.submitDataStart.getType():
      return {
        ...state,
        saving: true,
      };
    case "ETO_FLOW_SET_START_DATE":
    case "ETO_FLOW_CLEAR_START_DATE":
      return {
        ...state,
        ...action.payload,
      };
    case actions.etoFlow.loadSignedInvestmentAgreement.getType():
      return {
        ...state,
        signedInvestmentAgreementUrlLoading: true,
      };
    case actions.etoFlow.setInvestmentAgreementHash.getType():
      return {
        ...state,
        signedInvestmentAgreementUrlLoading: false,
        signedInvestmentAgreementUrl: action.payload.signedInvestmentAgreementUrl,
      };
    case actions.etoFlow.setProducts.getType():
      return {
        ...state,
        products: action.payload.products,
      };
    case actions.etoFlow.setEtoDateStart.getType():
      return {
        ...state,
        etoDateSaving: true,
      };
    case actions.etoFlow.setEtoDateStop.getType():
      return {
        ...state,
        etoDateSaving: false,
      };
  }
  return state;
};
