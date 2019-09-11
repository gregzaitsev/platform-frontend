import {
  TBookbuildingStatsType,
  TCompanyEtoData,
  TEtoSpecsData,
  TPartialCompanyEtoData,
  TPartialEtoSpecData,
} from "../../lib/api/eto/EtoApi.interfaces.unsafe";
import { TEtoProducts } from "../../lib/api/eto/EtoProductsApi.interfaces";

export type TGeneralEtoData = {
  etoData: TPartialEtoSpecData;
  companyData: TPartialCompanyEtoData;
};

export interface IEtoFlowState {
  eto: TEtoSpecsData | undefined;
  company: TCompanyEtoData | undefined;
  products?: TEtoProducts;
  loading: boolean;
  saving: boolean;
  bookbuildingStats: TBookbuildingStatsType[];
  newStartDate?: Date;
  signedInvestmentAgreementUrlLoading: boolean;
  signedInvestmentAgreementUrl: string | null;
  etoDateSaving: boolean;
}

export enum EEtoFormTypes {
  CompanyInformation = "companyInformation",
  LegalInformation = "legalInformation",
  KeyIndividuals = "keyIndividuals",
  ProductVision = "productVision",
  EtoTerms = "etoTerms",
  EtoInvestmentTerms = "etoInvestmentTerms",
  EtoMedia = "etoMedia",
  EtoVotingRights = "etoVotingRights",
  EtoEquityTokenInfo = "etoEquityTokenInfo",
  EtoRiskAssessment = "etoRiskAssessment",
}
