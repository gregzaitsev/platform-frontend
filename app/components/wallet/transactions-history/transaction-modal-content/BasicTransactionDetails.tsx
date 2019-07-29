import * as React from "react";
import { FormattedDate, FormattedRelative } from "react-intl";
import { FormattedMessage } from "react-intl-phraseapp";

import { TTxHistory } from "../../../../modules/tx-history/types";
import { DataRow, DataRowSeparator } from "../../../modals/tx-sender/shared/DataRow";
import { ESize, TransactionData } from "../../../shared/TransactionData";

interface IExternalProps {
  transaction: TTxHistory;
}

const BasicTransactionDetails: React.FunctionComponent<IExternalProps> = ({ transaction }) => (
  <>
    <DataRow
      className="mt-4"
      caption={<FormattedMessage id="wallet.tx-list.modal.common.status.caption" />}
      value={<FormattedMessage id="wallet.tx-list.modal.common.status.complete" />}
    />

    <DataRow
      caption={<FormattedMessage id="wallet.tx-list.modal.common.time.caption" />}
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

    <DataRowSeparator />
  </>
);

export { BasicTransactionDetails };
