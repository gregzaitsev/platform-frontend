import * as cn from "classnames";
import * as React from "react";
import { FormattedDate, FormattedRelative } from "react-intl";

import { TTxHistory } from "../../../../modules/tx-history/types";
import { DataRow } from "../../../modals/tx-sender/shared/DataRow";
import { ESize, TransactionData } from "../../../shared/TransactionData";

import * as styles from "../../../modals/tx-sender/withdraw-flow/Withdraw.module.scss";

interface IExternalProps {
  transaction: TTxHistory;
}

const BasicTransactionDetails: React.FunctionComponent<IExternalProps> = ({ transaction }) => (
  <>
    <DataRow className={cn(styles.withSpacing, "mt-4")} caption={"Status"} value={"Complete"} />

    <DataRow
      className={styles.withSpacing}
      caption={"Time"}
      value={
        <TransactionData
          top={<FormattedRelative value={transaction.date} />}
          bottom={
            <FormattedDate
              value={transaction.date}
              timeZone="UTC"
              timeZoneName="short"
              year="numeric"
              month="short"
              day="numeric"
              hour="numeric"
              minute="numeric"
            />
          }
          size={ESize.MEDIUM}
        />
      }
    />
  </>
);

export { BasicTransactionDetails };
