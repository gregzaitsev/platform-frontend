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

export type TEtoTx = {
  type: ETransactionType.ETO_INVESTMENT | ETransactionType.ETO_REFUND;
  subType: undefined;
  companyName: string;
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

export type TTx = {
  type:
    | ETransactionType.NEUR_PURCHASE
    | ETransactionType.NEUR_REDEEM
    | ETransactionType.ETO_TOKENS_CLAIM
    | ETransactionType.REDISTRIBUTE_PAYOUT
    | ETransactionType.PAYOUT
    | ETransactionType.NEUR_DESTROY;
  subType: undefined;
};

export type TTxHistory = (TEtoTx | TTx | TTransferEquityToken | TTransferWellKnownToken) &
  TTxHistoryCommon;
