import * as React from "react";
import { FormattedHTMLMessage, FormattedMessage } from "react-intl-phraseapp";

import { AccountSetupKycPendingComponent } from "../settings/kyc-states/KycStatusWidget";
import { DashboardTitle } from "./NomineeDashboard";
import { EKycRequestStatus } from "../../lib/api/KycApi.interfaces";
import { StepStatus } from "./DashboardStepStatus";

interface IKycPending {
  kycRequestStatus: EKycRequestStatus
}

export const NomineeKycPending: React.FunctionComponent<IKycPending> = ({ kycRequestStatus }) => (
  <><DashboardTitle
    title={<FormattedHTMLMessage tagName="span" id="account-setup.thank-you-title" />}
    text={<FormattedMessage id="account-setup.thank-you-text" />}
  />
    <StepStatus
      contentTitleComponent={<FormattedMessage id="account-setup.pending-kyc.title" />}
      contentTextComponent={<FormattedHTMLMessage tagName="span" id="account-setup.pending-kyc.text" />}
      mainComponent={<AccountSetupKycPendingComponent />}
      status={kycRequestStatus}
    />
  </>
);
