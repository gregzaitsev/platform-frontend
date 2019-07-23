import * as React from "react";
import { FormattedDate, FormattedRelative } from "react-intl";

import { TTxHistory } from "../../../../modules/tx-history/types";
import { DataRow } from "../../../modals/tx-sender/shared/DataRow";
import { ESize, TransactionData } from "../../../shared/TransactionData";

interface IExternalProps {
  transaction: TTxHistory;
}

const BasicTransactionDetails: React.FunctionComponent<IExternalProps> = ({ transaction }) => (
  <>
    <DataRow className="mt-4" caption={"Status"} value={"Complete"} />

    <DataRow
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
