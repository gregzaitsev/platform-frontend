import { TEtoInvestmentCalculatedValues } from "../../../../lib/api/eto/EtoApi.interfaces.unsafe";

export type TInvestmentAdditionalData = {
  eto: {
    etoId: string;
    companyName: string;
    existingShareCapital: number;
    preMoneyValuationEur: number;
    equityTokensPerShare: number;
    investmentCalculatedValues: Partial<TEtoInvestmentCalculatedValues>;
  };
  equityTokens: string;
  estimatedReward: string;
  etherPriceEur: string;
  gasCostEth: string;
  investmentEth: string;
  investmentEur: string;
  isIcbm: boolean;
};
