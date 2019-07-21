import * as React from "react";

import { ETransactionType } from "../../../lib/api/analytics-api/interfaces";
import { TTxHistory } from "../../../modules/tx-history/types";
import { CommonHtmlProps, TTranslatedString } from "../../../types";
import { assertNever } from "../../../utils/assertNever";
import { EHeadingSize, Heading } from "../../shared/Heading";
import { EtherscanTxLink } from "../../shared/links/EtherscanLink";
import { EtoTokensClaimTransactionDetails } from "./transaction-modal-content/EtoTokensClaimTransactionDetails";
import { NEurPurchaseTransactionDetails } from "./transaction-modal-content/NEurPurchaseTransactionDetails";
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
    case ETransactionType.ETO_INVESTMENT:
    case ETransactionType.ETO_REFUND:
    case ETransactionType.NEUR_REDEEM:
    case ETransactionType.ETO_TOKENS_CLAIM:
      return <EtoTokensClaimTransactionDetails {...props} />;
    case ETransactionType.REDISTRIBUTE_PAYOUT:
    case ETransactionType.PAYOUT:
    case ETransactionType.NEUR_DESTROY:
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
