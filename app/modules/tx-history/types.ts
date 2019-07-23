import {
  ECurrency,
  ENumberInputFormat,
  EquityToken,
} from "../../components/shared/formatters/utils";
import { ETransactionDirection, ETransactionType } from "../../lib/api/analytics-api/interfaces";
import { EthereumAddressWithChecksum, EthereumTxHash } from "../../types";

export enum ETransactionSubType {
  TRANSFER_EQUITY_TOKEN = "tokenTransfer",
}

export type TTxHistoryCommon = {
  amount: string;
  amountFormat: ENumberInputFormat;
  blockNumber: number;
  currency: ECurrency | EquityToken;
  date: string;
  id: string;
  logIndex: number;
  transactionDirection: ETransactionDirection;
  transactionIndex: number;
  txHash: EthereumTxHash;
};

export type TEtoInvestmentTx = {
  type: ETransactionType.ETO_INVESTMENT;
  subType: undefined;
  companyName: string;
};

export type TEtoRefundTx = {
  type: ETransactionType.ETO_REFUND;
  subType: undefined;
  companyName: string;
  etoId: string;
  currency: ECurrency;
  amountEur: string;
  toAddress: EthereumAddressWithChecksum;
};

export type TTransferEquityToken = {
  type: ETransactionType.TRANSFER;
  subType: ETransactionSubType.TRANSFER_EQUITY_TOKEN;
  currency: EquityToken;
  etoId: EthereumAddressWithChecksum;
  from: EthereumAddressWithChecksum;
  to: EthereumAddressWithChecksum;
  icon: string | undefined;
};

export type TTransferWellKnownToken = {
  type: ETransactionType.TRANSFER;
  subType: undefined;
  currency: ECurrency;
  amountEur: string;
  from: EthereumAddressWithChecksum;
  to: EthereumAddressWithChecksum;
};

export type TNEURTransfer = {
  type: ETransactionType.NEUR_PURCHASE;
  subType: undefined;
  currency: ECurrency.EUR_TOKEN;
  to: EthereumAddressWithChecksum;
};

export type TNEURRedeemTransfer = {
  type: ETransactionType.NEUR_REDEEM;
  subType: undefined;
  currency: ECurrency.EUR_TOKEN;
};

export type TNEURDestroyTransfer = {
  type: ETransactionType.NEUR_DESTROY;
  subType: undefined;
  liquidatedByAddress: EthereumAddressWithChecksum;
  currency: ECurrency.EUR_TOKEN;
};

export type EtoTokensClaimTransfer = {
  type: ETransactionType.ETO_TOKENS_CLAIM;
  subType: undefined;
  currency: EquityToken;
  etoId: EthereumAddressWithChecksum;
  neuReward: string;
  icon: string;
  neuRewardEur: string;
};

export type TPayoutTransfer = {
  type: ETransactionType.PAYOUT;
  subType: undefined;
  amountEur: string;
  currency: ECurrency;
  toAddress: EthereumAddressWithChecksum;
};

export type TRedistributePayoutTransfer = {
  type: ETransactionType.REDISTRIBUTE_PAYOUT;
  subType: undefined;
  amountEur: string;
  currency: ECurrency;
};

export type TTxHistory = (
  | TEtoRefundTx
  | TEtoInvestmentTx
  | TPayoutTransfer
  | TRedistributePayoutTransfer
  | TTransferEquityToken
  | TTransferWellKnownToken
  | TNEURTransfer
  | TNEURRedeemTransfer
  | TNEURDestroyTransfer
  | EtoTokensClaimTransfer) &
  TTxHistoryCommon;

export type TExtractTxHistoryFromType<T extends ETransactionType> = Extract<
  TTxHistory,
  { type: T }
>;
