import { EEtoFormTypes } from "../../../modules/eto-flow/types";
import { EEtoState } from "./EtoApi.interfaces.unsafe";

export const etoFormIsReadonly = (formName: EEtoFormTypes, etoState?: EEtoState) => {
  const readOnlyForms = [
    EEtoFormTypes.EtoEquityTokenInfo,
    EEtoFormTypes.EtoTerms,
    EEtoFormTypes.EtoVotingRights,
    EEtoFormTypes.EtoInvestmentTerms,
  ];
  return etoState !== EEtoState.PREVIEW && readOnlyForms.includes(formName);
};
