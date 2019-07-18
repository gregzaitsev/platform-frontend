import * as React from "react";
import { FormattedMessage } from "react-intl-phraseapp";

import { EAdditionalValidationDataWarrning } from "../../../../modules/tx/types";
import { assertNever } from "../../../../utils/assertNever";

const WarningLabel: React.FunctionComponent<{
  warning: EAdditionalValidationDataWarrning;
}> = ({ warning }) => {
  switch (warning) {
    case EAdditionalValidationDataWarrning.IS_NOT_ENOUGH_ETHER:
      return (
        <span data-test-id="modals.tx-sender.withdraw-flow.withdraw-component.not-enough-ether">
          <FormattedMessage id="modals.tx-sender.withdraw-flow.withdraw-component.errors.value-higher-than-balance" />
        </span>
      );
    case EAdditionalValidationDataWarrning.IS_SMART_CONTRACT:
      return (
        <span data-test-id="modals.tx-sender.withdraw-flow.withdraw-component.smart-contract">
          <FormattedMessage id="modal.sent-eth.smart-contract-address" />
        </span>
      );
    case EAdditionalValidationDataWarrning.IS_NEW_ADDRESS:
      return (
        <span data-test-id="modals.tx-sender.withdraw-flow.withdraw-component.new-address">
          <FormattedMessage id="modal.sent-eth.new-address" />
        </span>
      );
    default:
      return assertNever(warning);
  }
};

export { WarningLabel };
