import * as React from "react";
import { branch, compose, nest, renderComponent, withProps } from "recompose";
import { FormattedMessage } from "react-intl-phraseapp";

import { withContainer } from "../../utils/withContainer.unsafe";
import { Layout } from "../layouts/Layout";
import { appConnect } from "../../store";
import { SelectIsVerificationFullyDone } from "../../modules/selectors";
import { selectBackupCodesVerified, selectIsUserEmailVerified } from "../../modules/auth/selectors";
import { selectNomineeKycRequestStatus } from "../../modules/kyc/selectors";
import { ERequestStatus } from "../../lib/api/KycApi.interfaces";
import { Panel } from "../shared/Panel";


const AccountSetupStep = ({stepData}) => {
  return <div className="acocunt-steup-step-wrapper">
    <div className="step-ticker">{stepData.condition === true ? "x":"0"}</div>
    <div className="step-title">{stepData.title}</div>
    <div className="step-component" >{stepData.component}</div>
  </div>
};

const NomineeDashboardLayout = ({
  accountSetupStepsData
}) => {
  return accountSetupStepsData.map((stepData) => {
    return <AccountSetupStep stepData={stepData} />;
  })
};

const nomineeAccountSetupSteps = (emailVerified, backupCodesVerified, kycRequestStatusIsDraft) => [
  {
    key: 'verifyEmail',
    conditionCompleted: emailVerified,
    title: <FormattedMessage id="account-setup.verify-email" />,
    component: <>email</>
  },
  {
    key: 'verifyBackupCodes',
    conditionCompleted: emailVerified,
    title: <FormattedMessage id="account-setup.verify-backup-codes" />,
    component: <>backup codes</>
  },
  {
    key: 'startKyc',
    conditionCompleted: kycRequestStatusIsDraft,
    title: <FormattedMessage id="account-setup.verify-your-company" />,
    component: <>start kyc</>
  }
];


const AccountSetupContainer = ({ children }) => <div data-test-id="nominee-dashboard">
  <h1>
    <FormattedMessage id="account-setup.welcome-to-neufund" />
  </h1>
  <p>
    <FormattedMessage id="account-setup.please-complete-setup" />
  </p>
  <Panel>
    {children}
  </Panel>
</div>;


export const NomineeDashboard = compose(
  withContainer(nest(Layout, AccountSetupContainer)),
  appConnect({
    stateToProps: state => ({
      emailVerified: selectIsUserEmailVerified(state.auth),
      backupCodesVerified: selectBackupCodesVerified(state),
      kycRequestStatus: selectNomineeKycRequestStatus(state),
      verificationIsComplete: SelectIsVerificationFullyDone(state),
    })
  }),
  branch(props => props.kycRequestStatus === ERequestStatus.PENDING, renderComponent(() => <>kyc pending</>)),
  branch(props => props.verificationIsComplete, renderComponent(() => <>no tasks for you today</>)),
  withProps(({emailVerified, backupCodesVerified, kycRequestStatusIsDraft}) => {
    return ({
      accountSetupStepsData: nomineeAccountSetupSteps(emailVerified, backupCodesVerified, kycRequestStatusIsDraft)
    })
  }),
)(NomineeDashboardLayout);


// claims{
// isVerified: true
// isSophisticatedInvestor: true
// hasBankAccount: false
// isAccountFrozen: false
// }
// businessRequstState {
// status: "Accepted"
// }
