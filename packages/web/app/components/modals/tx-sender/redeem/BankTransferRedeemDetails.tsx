import * as React from "react";
import { FormattedMessage } from "react-intl-phraseapp";

import { ETxSenderType } from "../../../../modules/tx/types";
import { MoneyNew } from "../../../shared/formatters/Money";
import {
  ECurrency,
  ENumberInputFormat,
  ENumberOutputFormat,
} from "../../../shared/formatters/utils";
import { BankNumber } from "../../../wallet/BankAccount";
import { InfoList } from "../shared/InfoList";
import { InfoRow } from "../shared/InfoRow";
import { TimestampRow } from "../shared/TimestampRow";
import { TransactionDetailsComponent } from "../types";

const BankTransferRedeemDetails: TransactionDetailsComponent<ETxSenderType.NEUR_REDEEM> = ({
  additionalData,
  className,
  txTimestamp,
}) => (
  <InfoList className={className}>
    <InfoRow
      caption={<FormattedMessage id="bank-transfer.redeem.summary.to-bank-account" />}
      value={
        <BankNumber
          last4={additionalData.bankAccount.accountNumberLast4}
          bank={additionalData.bankAccount.bankName}
        />
      }
    />
    <InfoRow
      caption={<FormattedMessage id="bank-transfer.redeem.summary.return-amount" />}
      value={
        <MoneyNew
          inputFormat={ENumberInputFormat.FLOAT}
          value={additionalData.amount}
          valueType={ECurrency.EUR}
          outputFormat={ENumberOutputFormat.FULL}
          data-test-id={"bank-transfer.redeem-summary.return-amount"}
        />
      }
    />
    <InfoRow
      caption={<FormattedMessage id="bank-transfer.redeem.summary.bank-fee" />}
      value={
        <MoneyNew
          data-test-id="bank-transfer.redeem.fee"
          value={additionalData.bankFee}
          inputFormat={ENumberInputFormat.FLOAT}
          valueType={ECurrency.EUR}
          outputFormat={ENumberOutputFormat.FULL}
        />
      }
    />
    <InfoRow
      caption={<FormattedMessage id="bank-transfer.redeem.summary.total-return-amount" />}
      value={
        <MoneyNew
          data-test-id="bank-transfer.redeem.total"
          value={additionalData.totalRedeemed}
          inputFormat={ENumberInputFormat.FLOAT}
          valueType={ECurrency.EUR}
          outputFormat={ENumberOutputFormat.ONLY_NONZERO_DECIMALS}
        />
      }
    />

    {txTimestamp && <TimestampRow timestamp={txTimestamp} />}
  </InfoList>
);

export { BankTransferRedeemDetails };
