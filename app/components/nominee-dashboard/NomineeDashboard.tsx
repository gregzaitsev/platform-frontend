import * as React from "react";
import { compose,nest } from "recompose";
import { FormattedMessage } from "react-intl-phraseapp";

import { withContainer } from "../../utils/withContainer.unsafe";
import { Layout } from "../layouts/Layout";
import { appConnect } from "../../store";
import { SelectIsVerificationFullyDone } from "../../modules/selectors";
import { selectBackupCodesVerified, selectIsUserEmailVerified } from "../../modules/auth/selectors";
import { selectNomineeKycRequestStatus } from "../../modules/kyc/selectors";
import { ERequestStatus } from "../../lib/api/KycApi.interfaces";
import { Panel } from "../shared/Panel";

const NomineeDashboardLayout = ({
  emailVerified,
  backupCodesVerified,
  kycRequestStatus,
  verificationIsComplete
}) => {
  if(!emailVerified) {
    return <>email</>
  } else if(backupCodesVerified){
    return <>backupcode</>
  } else if (kycRequestStatus === ERequestStatus.DRAFT){
    return <>kyc</>
  } else if (kycRequestStatus === ERequestStatus.PENDING){
    return <>wait for confirmation</>
  } else if(verificationIsComplete) {
    return <>tasks </>
  }
}

const AccountSetupContainer = ({children}) => <div data-test-id="nominee-dashboard">
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
  appConnect({
    stateToProps: state => ({
      emailVerified: selectIsUserEmailVerified(state.auth),
      backupCodesVerified: selectBackupCodesVerified(state),
      kycRequestStatus: selectNomineeKycRequestStatus(state),
      verificationIsComplete: SelectIsVerificationFullyDone(state),
    })
  }),
  withContainer(nest(Layout,AccountSetupContainer))
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
