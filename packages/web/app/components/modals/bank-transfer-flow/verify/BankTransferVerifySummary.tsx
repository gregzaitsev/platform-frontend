import * as React from "react";
import { FormattedHTMLMessage, FormattedMessage } from "react-intl-phraseapp";
import { Container } from "reactstrap";
import { compose } from "recompose";

import { KycBankQuintessenceBankAccount } from "../../../../lib/api/kyc/KycApi.interfaces";
import { actions } from "../../../../modules/actions";
import {
  selectBankTransferFlowReference,
  selectBankTransferMinAmount,
} from "../../../../modules/bank-transfer-flow/selectors";
import { selectQuintessenceBankAccount } from "../../../../modules/kyc/selectors";
import { appConnect } from "../../../../store";
import { ButtonArrowRight } from "../../../shared/buttons";
import { Money } from "../../../shared/formatters/Money";
import {
  ECurrency,
  ENumberInputFormat,
  ENumberOutputFormat,
} from "../../../shared/formatters/utils";
import { EHeadingSize, Heading } from "../../../shared/Heading";
import { InfoList } from "../../tx-sender/shared/InfoList";
import { InfoRow } from "../../tx-sender/shared/InfoRow";

interface IStateProps {
  referenceCode: string;
  minAmount: string;
  quintessenceBankAccount: KycBankQuintessenceBankAccount;
}

interface IDispatchProps {
  continueToSuccess: () => void;
}

type IProps = IStateProps & IDispatchProps;

const BankTransferVerifySummaryLayout: React.FunctionComponent<IProps> = ({
  quintessenceBankAccount,
  continueToSuccess,
  referenceCode,
  minAmount,
}) => (
  <Container>
    <Heading size={EHeadingSize.SMALL} level={4} className="mb-4">
      <FormattedMessage id="bank-transfer.verify.summary.title" />
    </Heading>

    <p className="mb-3">
      <FormattedHTMLMessage id="bank-transfer.verify.summary.description" tagName="span" />
    </p>

    <InfoList className="mb-4">
      <InfoRow
        data-test-id="bank-transfer.summary.amount"
        caption={<FormattedMessage id="bank-transfer.verify.summary.min-amount" />}
        value={
          <Money
            value={minAmount}
            inputFormat={ENumberInputFormat.ULPS}
            valueType={ECurrency.EUR}
            outputFormat={ENumberOutputFormat.ONLY_NONZERO_DECIMALS}
          />
        }
      />
      <InfoRow
        caption={<FormattedMessage id="bank-transfer.summary.purchase-price.caption" />}
        value={<FormattedMessage id="bank-transfer.summary.purchase-price.value" />}
      />
      <InfoRow
        data-test-id="bank-transfer.summary.recipient"
        caption={<FormattedMessage id="bank-transfer.summary.recipient" />}
        allowClipboardCopy={true}
        value={quintessenceBankAccount.name}
      />
      <InfoRow
        data-test-id="bank-transfer.summary.iban"
        caption={<FormattedMessage id="bank-transfer.summary.iban" />}
        allowClipboardCopy={true}
        value={quintessenceBankAccount.bankAccountNumber}
      />
      <InfoRow
        data-test-id="bank-transfer.summary.bic"
        caption={<FormattedMessage id="bank-transfer.summary.bic" />}
        allowClipboardCopy={true}
        value={quintessenceBankAccount.swiftCode}
      />
      <InfoRow
        caption={<FormattedMessage id="bank-transfer.summary.reference-number" />}
        data-test-id="bank-transfer.summary.reference-number"
        allowClipboardCopy={true}
        value={referenceCode}
      />
    </InfoList>

    <p className="text-warning mx-4">
      <FormattedMessage id="bank-transfer.verify.summary.note" />
    </p>

    <section className="text-center">
      <ButtonArrowRight
        onClick={continueToSuccess}
        data-test-id="bank-transfer.summary.transfer-completed"
      >
        <FormattedMessage id="bank-transfer.summary.transfer-completed" />
      </ButtonArrowRight>
    </section>
  </Container>
);

const BankTransferVerifySummary = compose<IProps, {}>(
  appConnect<IStateProps, IDispatchProps>({
    stateToProps: state => {
      const quintessenceBankAccount = selectQuintessenceBankAccount(state);

      if (!quintessenceBankAccount) {
        throw new Error("Quintessence bank account can't be undefined");
      }

      return {
        quintessenceBankAccount,
        referenceCode: selectBankTransferFlowReference(state),
        minAmount: selectBankTransferMinAmount(state),
      };
    },
    dispatchToProps: dispatch => ({
      continueToSuccess: () => dispatch(actions.bankTransferFlow.continueToSuccess()),
    }),
  }),
)(BankTransferVerifySummaryLayout);

export { BankTransferVerifySummaryLayout, BankTransferVerifySummary };
