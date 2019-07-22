import * as React from "react";

import { ETransactionType } from "../../../lib/api/analytics-api/interfaces";
import { TTxHistory } from "../../../modules/tx-history/types";
import { CommonHtmlProps, TTranslatedString } from "../../../types";
import { assertNever } from "../../../utils/assertNever";
import { EHeadingSize, Heading } from "../../shared/Heading";
import { EtherscanTxLink } from "../../shared/links/EtherscanLink";
import { EtoRefundTransactionsDetails } from "./transaction-modal-content/EtoRefundTransactionDetails";
import { EtoTokensClaimTransactionDetails } from "./transaction-modal-content/EtoTokensClaimTransactionDetails";
import { NEurDestroyTransactionDetails } from "./transaction-modal-content/NEurDestroyTransactionDetails";
import { NEurPurchaseTransactionDetails } from "./transaction-modal-content/NEurPurchaseTransactionDetails";
import { PayoutTransactionsDetails } from "./transaction-modal-content/PayoutTransactionDetails";
import { TransferTransactionDetails } from "./transaction-modal-content/TransferTransactionDetails";
import { TransactionName } from "./TransactionName";

import * as styles from "../../modals/tx-sender/withdraw-flow/Withdraw.module.scss";

interface IExternalProps {
  closeModal: () => void;
  transaction: TTxHistory;
}

const ModalHeading: React.FunctionComponent<{ children: TTranslatedString } & CommonHtmlProps> = ({
  children,
  className,
}) => (
  <Heading
    size={EHeadingSize.HUGE}
    level={4}
    decorator={false}
    disableTransform={true}
    className={className}
  >
    {children}
  </Heading>
);

const TransactionTypeToComponentMap: React.FunctionComponent<IExternalProps> = props => {
  switch (props.transaction.type) {
    case ETransactionType.TRANSFER:
      return <TransferTransactionDetails {...props} />;
    case ETransactionType.NEUR_PURCHASE:
      return <NEurPurchaseTransactionDetails {...props} />;
    case ETransactionType.ETO_TOKENS_CLAIM:
      return <EtoTokensClaimTransactionDetails {...props} />;
    case ETransactionType.NEUR_DESTROY:
      return <NEurDestroyTransactionDetails {...props} />;
    case ETransactionType.ETO_REFUND:
      return <EtoRefundTransactionsDetails {...props} />;
    case ETransactionType.REDISTRIBUTE_PAYOUT:
    case ETransactionType.PAYOUT:
      return <PayoutTransactionsDetails {...props} />;
    case ETransactionType.ETO_INVESTMENT:
    case ETransactionType.NEUR_REDEEM:
      return null;
    default:
      return assertNever(props.transaction, "Can't find component related to transaction");
  }
};

export const TransactionDetailsModal: React.FunctionComponent<IExternalProps> = props => (
  <section className={styles.contentWrapper}>
    <ModalHeading>
      <TransactionName transaction={props.transaction} />
    </ModalHeading>

    <TransactionTypeToComponentMap {...props} />

    <EtherscanTxLink txHash={props.transaction.txHash}>Etherscan</EtherscanTxLink>
  </section>
);
