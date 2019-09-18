import { TEtoWithCompanyAndContract } from "../../../modules/eto/types";
import { TEtoSpecsData, TPartialEtoSpecData } from "./EtoApi.interfaces.unsafe";

export const calcInvestmentAmount = (eto: TPartialEtoSpecData, sharePrice: number | undefined) => ({
  minInvestmentAmount: calcMaxInvestmentAmount(sharePrice, eto.minimumNewSharesToIssue),
  maxInvestmentAmount: calcMaxInvestmentAmountWithDiscount(eto, sharePrice, eto.newSharesToIssue),
});

export const calcNumberOfTokens = ({
  newSharesToIssue = 1,
  minimumNewSharesToIssue = 0,
  equityTokensPerShare = 1,
}: TPartialEtoSpecData) => ({
  computedMaxNumberOfTokens: newSharesToIssue * equityTokensPerShare,
  computedMinNumberOfTokens: minimumNewSharesToIssue * equityTokensPerShare,
});

export const calcCapFraction = ({
  newSharesToIssue = 1,
  minimumNewSharesToIssue = 0,
  existingShareCapital = 1,
  newShareNominalValue = 1,
}: TPartialEtoSpecData) => ({
  computedMaxCapPercent: (newSharesToIssue * newShareNominalValue) / existingShareCapital,
  computedMinCapPercent: (minimumNewSharesToIssue * newShareNominalValue) / existingShareCapital,
});

export const calcShareAndTokenPrice = ({
  preMoneyValuationEur = 0,
  existingShareCapital = 0,
  newShareNominalValue = 1,
  equityTokensPerShare = 1,
}: TPartialEtoSpecData) => {
  let sharePrice = 0;
  let tokenPrice = 0;
  if (existingShareCapital !== 0 && equityTokensPerShare !== 0 && preMoneyValuationEur !== 0) {
    sharePrice = (preMoneyValuationEur * newShareNominalValue) / existingShareCapital;
    tokenPrice = sharePrice / equityTokensPerShare;
  }
  return {
    sharePrice,
    tokenPrice,
  };
};

const calcMaxInvestmentAmountWithDiscount = (
  {
    newSharesToIssueInFixedSlots = 0,
    newSharesToIssueInWhitelist = 0,
    fixedSlotsMaximumDiscountFraction = 0,
    whitelistDiscountFraction = 0,
    publicDiscountFraction = 0,
  }: TPartialEtoSpecData,
  sharePrice = 0,
  shares = 0,
) => {
  if (sharePrice === 0 || shares === 0) {
    return 0;
  }

  if (
    fixedSlotsMaximumDiscountFraction > 1 ||
    whitelistDiscountFraction > 1 ||
    publicDiscountFraction > 1
  ) {
    throw new Error("Fraction number is required instead of percentage value");
  }

  let amount = 0;

  if (fixedSlotsMaximumDiscountFraction > 0 && shares > 0) {
    const minShares = Math.min(newSharesToIssueInFixedSlots, shares);

    amount += minShares * sharePrice * (1 - fixedSlotsMaximumDiscountFraction);
    shares -= minShares;
  }

  if (whitelistDiscountFraction > 0 && shares > 0) {
    const minShares = Math.min(newSharesToIssueInWhitelist, shares);

    amount += minShares * sharePrice * (1 - whitelistDiscountFraction);
    shares -= minShares;
  }

  if (shares > 0) {
    amount += shares * sharePrice * (1 - publicDiscountFraction);
  }

  return amount;
};

const calcMaxInvestmentAmount = (sharePrice = 0, shares = 0) => {
  if (sharePrice === 0 || shares === 0) {
    return 0;
  }
  return shares * sharePrice;
};

export const getInvestmentCalculatedPercentage = (eto: TEtoSpecsData) =>
  (eto.newSharesToIssue / eto.minimumNewSharesToIssue) * 100;

export const getCurrentInvestmentProgressPercentage = (eto: TEtoWithCompanyAndContract) => {
  const totalTokensInt = eto.contract!.totalInvestment.totalTokensInt;

  return (
    (parseInt(totalTokensInt, 10) / (eto.minimumNewSharesToIssue * eto.equityTokensPerShare)) * 100
  );
};
