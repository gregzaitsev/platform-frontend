import * as React from "react";
import { FormattedMessage } from "react-intl-phraseapp";

import { ETxSenderType } from "../../../../modules/tx/types";
import { MoneyNew } from "../../../shared/formatters/Money";
import {
  ECurrency,
  ENumberInputFormat,
  ENumberOutputFormat,
} from "../../../shared/formatters/utils";
import { InfoList } from "../shared/InfoList";
import { InfoRow } from "../shared/InfoRow";
import { TimestampRow } from "../shared/TimestampRow";
import { TransactionDetailsComponent } from "../types";

const WithdrawTransactionDetails: TransactionDetailsComponent<ETxSenderType.WITHDRAW> = ({
  additionalData,
  className,
  txTimestamp,
}) => (
  <InfoList className={className}>
    <InfoRow
      caption={<FormattedMessage id="withdraw-flow.to" />}
      value={additionalData.to}
      data-test-id="modals.tx-sender.withdraw-flow.summary.to"
    />

    <InfoRow
      caption={<FormattedMessage id="withdraw-flow.value" />}
      value={
        <MoneyNew
          inputFormat={ENumberInputFormat.ULPS}
          outputFormat={ENumberOutputFormat.FULL}
          valueType={ECurrency.ETH}
          value={additionalData.value}
        />
      }
      data-test-id="modals.tx-sender.withdraw-flow.summary.value"
    />

    <InfoRow
      caption={<FormattedMessage id="withdraw-flow.transaction-cost" />}
      value={
        <MoneyNew
          inputFormat={ENumberInputFormat.ULPS}
          outputFormat={ENumberOutputFormat.FULL}
          valueType={ECurrency.ETH}
          value={additionalData.cost}
        />
      }
      data-test-id="modals.tx-sender.withdraw-flow.summary.cost"
    />

    {txTimestamp && <TimestampRow timestamp={txTimestamp} />}
  </InfoList>
);

export { WithdrawTransactionDetails };
