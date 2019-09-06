import BigNumber from "bignumber.js";
import { includes } from "lodash/fp";

import { IWindowWithData } from "../../../test/helperTypes";
import { ECurrency } from "../../components/shared/formatters/utils";
import { Q18 } from "../../config/constants";
import { EUserType } from "../../lib/api/users/interfaces";
import { convertToBigInt } from "../../utils/Number.utils";
import { EETOStateOnChain } from "../eto/types";
import {
  EUserRefundStatus,
  ICalculatedContribution,
  IInvestorTicket,
  ITokenDisbursal,
} from "./types";

export const convertToCalculatedContribution = ([
  isWhitelisted,
  isEligible,
  minTicketEurUlps,
  maxTicketEurUlps,
  equityTokenInt,
  neuRewardUlps,
  maxCapExceeded,
]: [
  boolean,
  boolean,
  BigNumber,
  BigNumber,
  BigNumber,
  BigNumber,
  boolean
]): ICalculatedContribution => ({
  isWhitelisted,
  isEligible,
  minTicketEurUlps: minTicketEurUlps.toString(),
  maxTicketEurUlps: maxTicketEurUlps.toString(),
  equityTokenInt: equityTokenInt.toString(),
  neuRewardUlps: neuRewardUlps.toString(),
  maxCapExceeded,
});

export const convertToInvestorTicket = ([
  equivEurUlps,
  rewardNmkUlps,
  equityTokenInt,
  sharesInt,
  tokenPrice,
  neuRate,
  amountEth,
  amountEurUlps,
  claimedOrRefunded,
  usedLockedAccount,
]: [
  BigNumber,
  BigNumber,
  BigNumber,
  BigNumber,
  BigNumber,
  BigNumber,
  BigNumber,
  BigNumber,
  boolean,
  boolean
]): IInvestorTicket => ({
  equivEurUlps: equivEurUlps.toString(),
  rewardNmkUlps: rewardNmkUlps.toString(),
  equityTokenInt: equityTokenInt.toString(),
  sharesInt: sharesInt.toString(),
  tokenPrice: tokenPrice.toString(),
  neuRate: neuRate.toString(),
  amountEth: amountEth.toString(),
  amountEurUlps: amountEurUlps.toString(),
  claimedOrRefunded,
  usedLockedAccount,
});

export const convertToTokenDisbursal = (
  token: ECurrency,
  [amountToBeClaimed, totalDisbursedAmount, timeToFirstDisbursalRecycle]: [
    BigNumber,
    BigNumber,
    BigNumber,
    BigNumber
  ],
): ITokenDisbursal => ({
  token,
  amountToBeClaimed: amountToBeClaimed.toString(),
  totalDisbursedAmount: totalDisbursedAmount.toString(),
  // convert seconds timestamp to milliseconds
  timeToFirstDisbursalRecycle: timeToFirstDisbursalRecycle.mul(1000).toNumber(),
});

export const getTokenPrice = (equityTokenInt: string, equivEurUlps: string): string => {
  const equivEurUlpsBn = new BigNumber(equivEurUlps);
  if (equivEurUlpsBn.isZero()) {
    return "0";
  }

  const equityToken = Q18.mul(equityTokenInt);
  return equivEurUlpsBn.div(equityToken).toString();
};

export const getRequiredIncomingAmount = (token: ECurrency) => {
  // In case of Cypress tests we have to return 0 by default to prevent tests with low amounts from crash
  // If there is data stored in window use it
  if (process.env.NF_CYPRESS_RUN === "1") {
    const { payoutRequiredAmount } = window as IWindowWithData;
    return payoutRequiredAmount || "0";
  }

  switch (token) {
    case ECurrency.ETH: {
      return convertToBigInt(1);
    }
    case ECurrency.EUR_TOKEN: {
      return convertToBigInt(100);
    }
    default:
      return "0";
  }
};

export const isPastInvestment = (etoState: EETOStateOnChain) =>
  includes(etoState, [EETOStateOnChain.Payout, EETOStateOnChain.Refund, EETOStateOnChain.Claim]);

// TODO: Remove dependency on userType
export const getRefundStatus = (
  etoState: EETOStateOnChain,
  userType: EUserType | undefined,
  doesInvestorInvest: boolean,
  investorTicket: IInvestorTicket | undefined,
): EUserRefundStatus => {
  if (
    etoState === EETOStateOnChain.Refund &&
    userType === EUserType.INVESTOR &&
    doesInvestorInvest &&
    investorTicket
  ) {
    if (investorTicket.claimedOrRefunded) {
      return EUserRefundStatus.CLAIMED;
    } else {
      return EUserRefundStatus.CAN_CLAIM;
    }
  } else {
    return EUserRefundStatus.CANNOT_CLAIM;
  }
};
