import { expect } from "chai";

import { calcInvestmentAmount, calcShareAndTokenPrice } from "./EtoUtils";

describe("EtoUtils", () => {
  describe("getShareAndTokenPrice", () => {
    it("should return correct sharePrice and TokenPrice", () => {
      expect(
        calcShareAndTokenPrice({
          preMoneyValuationEur: 1000,
          existingShareCapital: 100,
          equityTokensPerShare: 100,
        }),
      ).to.deep.equal({ sharePrice: 10, tokenPrice: 0.1 });
    });

    it("should return sharePrice as 0 when one of argument is undefined or 0", () => {
      expect(
        calcShareAndTokenPrice({ preMoneyValuationEur: 100, existingShareCapital: undefined }),
      ).to.deep.equal({ sharePrice: 0, tokenPrice: 0 });
      expect(
        calcShareAndTokenPrice({ preMoneyValuationEur: undefined, existingShareCapital: 100 }),
      ).to.deep.equal({ sharePrice: 0, tokenPrice: 0 });
      expect(
        calcShareAndTokenPrice({
          preMoneyValuationEur: undefined,
          existingShareCapital: 100,
          equityTokensPerShare: 100,
        }),
      ).to.deep.equal({ sharePrice: 0, tokenPrice: 0 });
    });
  });

  describe("getInvestmentAmount", () => {
    it("should calculate correctly minInvestmentAmount", () => {
      const eto = {
        preMoneyValuationEur: 1000,
        existingShareCapital: 10,
        minimumNewSharesToIssue: 100,
        newSharesToIssue: undefined,
        newSharesToIssueInFixedSlots: 10,
        newSharesToIssueInWhitelist: 5,
        fixedSlotsMaximumDiscountFraction: 0.8,
        whitelistDiscountFraction: 0.5,
        publicDiscountFraction: 0,
      };
      const sharePrice = 100;
      const { minInvestmentAmount } = calcInvestmentAmount(eto, sharePrice);

      expect(minInvestmentAmount).to.equal(8950);
    });

    it("should return minInvestmentAmount as 0 when minimumNewSharesToIssue is 0", () => {
      const eto = {
        preMoneyValuationEur: 1000,
        existingShareCapital: 10,
        minimumNewSharesToIssue: 0,
        newSharesToIssue: undefined,
        newSharesToIssueInFixedSlots: 10,
        newSharesToIssueInWhitelist: 5,
        fixedSlotsMaximumDiscountFraction: 0.8,
        whitelistDiscountFraction: 0.5,
        publicDiscountFraction: 0,
      };
      const sharePrice = 100;
      const { minInvestmentAmount } = calcInvestmentAmount(eto, sharePrice);

      expect(minInvestmentAmount).to.equal(0);
    });

    it("should calculate correctly investment amount", () => {
      const eto = {
        preMoneyValuationEur: 125000000,
        existingShareCapital: 40859,
        newSharesToIssue: 3652,
        minimumNewSharesToIssue: 1000,
        newSharesToIssueInFixedSlots: 2252,
        newSharesToIssueInWhitelist: 700,
        fixedSlotsMaximumDiscountFraction: 0.6,
        whitelistDiscountFraction: 0.4,
        publicDiscountFraction: 0,
      };
      const sharePrice = 3059.301500281456;
      const { minInvestmentAmount, maxInvestmentAmount } = calcInvestmentAmount(eto, sharePrice);

      expect(Math.round(maxInvestmentAmount)).to.equal(6182236);
      expect(Math.round(minInvestmentAmount)).to.equal(1223721);
    });

    it("should calculate correctly investment amount without whitelist", () => {
      // same terms but without whitelist
      const eto = {
        preMoneyValuationEur: 125000000,
        existingShareCapital: 40859,
        newSharesToIssue: 2952,
        minimumNewSharesToIssue: 1000,
        newSharesToIssueInFixedSlots: 2252,
        newSharesToIssueInWhitelist: 0,
        fixedSlotsMaximumDiscountFraction: 0.6,
        whitelistDiscountFraction: 0.4,
        publicDiscountFraction: 0,
      };
      const sharePrice = 3059.301500281456;
      const { minInvestmentAmount, maxInvestmentAmount } = calcInvestmentAmount(eto, sharePrice);

      expect(Math.round(maxInvestmentAmount)).to.equal(4897330);
      expect(Math.round(minInvestmentAmount)).to.equal(1223721);
    });
    it("should calculate correctly investment amount with no discounts", () => {
      const eto = {
        preMoneyValuationEur: 125000000,
        existingShareCapital: 40859,
        newSharesToIssue: 3652,
        minimumNewSharesToIssue: 0,
        newSharesToIssueInFixedSlots: 2252,
        newSharesToIssueInWhitelist: 700,
        fixedSlotsMaximumDiscountFraction: 0,
        whitelistDiscountFraction: 0,
        publicDiscountFraction: 0,
      };
      const sharePrice = 3059.301500281456;
      const { minInvestmentAmount, maxInvestmentAmount } = calcInvestmentAmount(eto, sharePrice);

      expect(Math.round(maxInvestmentAmount)).to.equal(Math.round(3652 * (125000000 / 40859)));
      expect(Math.round(minInvestmentAmount)).to.equal(0);
    });

    it("should calculate correctly investment amount with with public discount fraction", () => {
      // with public discount fraction
      const eto = {
        preMoneyValuationEur: 125000000,
        existingShareCapital: 40859,
        newSharesToIssue: 3652,
        minimumNewSharesToIssue: 1000,
        newSharesToIssueInFixedSlots: 2252,
        newSharesToIssueInWhitelist: 700,
        fixedSlotsMaximumDiscountFraction: 0.6,
        whitelistDiscountFraction: 0.4,
        publicDiscountFraction: 0.2,
      };
      const sharePrice = 3059.301500281456;
      const { minInvestmentAmount, maxInvestmentAmount } = calcInvestmentAmount(eto, sharePrice);

      expect(Math.round(maxInvestmentAmount)).to.equal(
        Math.round(2755818.79 + 1284906.63 + 1713208.84),
      );
      expect(Math.round(minInvestmentAmount)).to.equal(1223721);
    });

    it("should return maxInvestmentAmount as 0 when newSharesToIssue is 0", () => {
      const eto = {
        preMoneyValuationEur: 1000,
        existingShareCapital: 10,
        newSharesToIssue: 0,
        minimumNewSharesToIssue: undefined,
        newSharesToIssueInFixedSlots: 10,
        newSharesToIssueInWhitelist: 5,
        fixedSlotsMaximumDiscountFraction: 0.8,
        whitelistDiscountFraction: 0.5,
        publicDiscountFraction: 0,
      };
      const sharePrice = 100;
      const { minInvestmentAmount } = calcInvestmentAmount(eto, sharePrice);

      expect(minInvestmentAmount).to.equal(0);
    });
  });
});
