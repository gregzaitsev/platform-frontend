import { connectLinkBankAccountComponent } from "./ConnectLinkBankAccount";
import * as React from "react";
import { FormattedMessage } from "react-intl-phraseapp";

import { TBankAccount } from "../../../modules/kyc/types";
import { Button, ButtonSize, EButtonLayout } from "../../shared/buttons/Button";

import * as styles from "./LinkedBankAccountWidget.module.scss";

interface IProps {
  isBankAccountVerified: boolean
  bankAccount?: TBankAccount
  verifyBankAccount:() => void;
}

interface INoBankAccountProps {
  verifyBankAccount:() => void;
}

const NoBankAccount:React.FunctionComponent<INoBankAccountProps> = ({verifyBankAccount}) =>
  <>
    <Button
      className={styles.linkButton}
      onClick={verifyBankAccount}
      data-test-id="linked-bank-account-widget.link-different-account"
      layout={EButtonLayout.INLINE}
      size={ButtonSize.SMALL}
    >
      <FormattedMessage id="linked-bank-account-widget.link-different" />
    </Button>
  </>;

const NotVerifiedBankAccount = () => <>non-verified bank account. Here goes the account data</>;

const NomineeLinkedBankAccountLayout: React.FunctionComponent<IProps> =
  ({ isBankAccountVerified, bankAccount, verifyBankAccount }) => {
  if (bankAccount && bankAccount.hasBankAccount && !isBankAccountVerified) {
    return <NotVerifiedBankAccount/>
  } else {
    return <NoBankAccount verifyBankAccount={verifyBankAccount}/>
  }
};

const NomineeLinkedBankAccountComponent = connectLinkBankAccountComponent<{}>(NomineeLinkedBankAccountLayout);

export { NomineeLinkedBankAccountComponent, NomineeLinkedBankAccountLayout };

/*
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
</>;
 */
