import { connectLinkBankAccountComponent } from "./ConnectLinkBankAccount";
import * as styles from "./LinkedBankAccountWidget.module.scss";
import { FormattedMessage } from "react-intl-phraseapp";
import * as React from "react";
import { Button, ButtonSize, EButtonLayout } from "../../shared/buttons/Button";

const NomineeLinkedBankAccountLayout = (props) =>
  <>
    <Button
      className={styles.linkButton}
      onClick={props.verifyBankAccount}
      disabled={!props.isUserFullyVerified}
      data-test-id="linked-bank-account-widget.link-different-account"
      layout={EButtonLayout.INLINE}
      size={ButtonSize.SMALL}
    >
      <FormattedMessage id="linked-bank-account-widget.link-different" />
    </Button>
  </>

const NomineeLinkedBankAccountComponent = connectLinkBankAccountComponent<{}>(NomineeLinkedBankAccountLayout)

export { NomineeLinkedBankAccountComponent, NomineeLinkedBankAccountLayout };
