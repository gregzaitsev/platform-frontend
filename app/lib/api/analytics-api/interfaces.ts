import { EthereumAddressWithChecksum, EthereumTxHash } from "../../../types";
import * as YupTS from "../../yup-ts";

export enum ETransactionDirection {
  IN = "in",
  OUT = "out",
}

export enum ETransactionType {
  ETO_INVESTMENT = "eto_investment",
  ETO_REFUND = "eto_refund",
  ETO_TOKENS_CLAIM = "eto_tokens_claim",
  NEUR_PURCHASE = "neur_purchase",
  NEUR_REDEEM = "neur_redeem",
  TRANSFER = "transfer",
  PAYOUT = "payout",
  REDISTRIBUTE_PAYOUT = "redistribute_payout",
  NEUR_DESTROY = "neur_destroy",
}

export const AnalyticsTransactionTokenMetadataSchema = YupTS.object({
  companyName: YupTS.string().optional(),
  tokenImage: YupTS.string().optional(),
  tokenCommitmentAddress: YupTS.string<EthereumAddressWithChecksum>().optional(),
  tokenSymbol: YupTS.string(),
  tokenDecimals: YupTS.number(),
});
export type TAnalyticsTransactionTokenMetadata = YupTS.TypeOf<
  typeof AnalyticsTransactionTokenMetadataSchema
>;

export const AnalyticsTransactionExtraDataSchema = YupTS.object({
  amount: YupTS.number(),
  fromAddress: YupTS.string<EthereumAddressWithChecksum>().optional(),
  toAddress: YupTS.string<EthereumAddressWithChecksum>().optional(),
  tokenAddress: YupTS.string<EthereumAddressWithChecksum>().optional(),
  tokenInterface: YupTS.string().optional(),
  tokenMetadata: AnalyticsTransactionTokenMetadataSchema.optional(),
  assetTokenMetadata: AnalyticsTransactionTokenMetadataSchema.optional(),
});

export const AnalyticsTransactionSchema = YupTS.object({
  blockNumber: YupTS.number(),
  blockTime: YupTS.string(),
  extraData: AnalyticsTransactionExtraDataSchema,
  logIndex: YupTS.number(),
  transactionDirection: YupTS.string<ETransactionDirection>(),
  transactionIndex: YupTS.number(),
  txHash: YupTS.string<EthereumTxHash>(),
  type: YupTS.string<ETransactionType>(),
  version: YupTS.number(),
});
export type TAnalyticsTransaction = YupTS.TypeOf<typeof AnalyticsTransactionSchema>;

export const AnalyticsTransactionsResponseSchema = YupTS.object({
  beforeTransaction: YupTS.string().optional(),
  address: YupTS.string(),
  version: YupTS.number().optional(),
  transactions: YupTS.array(AnalyticsTransactionSchema),
});
export type TAnalyticsTransactionsResponse = YupTS.TypeOf<
  typeof AnalyticsTransactionsResponseSchema
>;
