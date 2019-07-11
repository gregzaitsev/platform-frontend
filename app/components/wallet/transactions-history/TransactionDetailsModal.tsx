import * as React from "react";

import { TTxHistory } from "../../../modules/tx-history/types";

interface IExternalProps {
  closeModal: () => void;
  transaction: TTxHistory;
}

const TransactionDetailsModal: React.FunctionComponent<IExternalProps> = ({
  closeModal,
  transaction,
}) => <>{transaction.type}</>;

export { TransactionDetailsModal };
