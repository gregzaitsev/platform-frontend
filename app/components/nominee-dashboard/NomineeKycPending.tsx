import * as React from "react";
import { FormattedHTMLMessage, FormattedMessage } from "react-intl-phraseapp";

import { AccountSetupKycPendingComponent } from "../settings/kyc-states/AccountSetupKycComponent";
import { DashboardTitle } from "./NomineeDashboard";
import { EKycRequestStatus } from "../../lib/api/KycApi.interfaces";
import { StepStatus } from "./DashboardStepStatus";
import { getMessageTranslation } from "../translatedMessages/messages";
import { kycStatusToTranslationMessage } from "../../modules/kyc/utils";
import * as styles from "./NomineeDashboard.module.scss";
import { Panel } from "../shared/Panel";
import { compose } from "recompose";
import { onEnterAction } from "../../utils/OnEnterAction";
import { actions } from "../../modules/actions";

interface IKycPendingProps {
  kycRequestStatus: EKycRequestStatus;
  emailVerified: boolean;
  backupCodesVerified: boolean;
}

export const NomineeKycPendingLayout: React.FunctionComponent<IKycPendingProps> = ({ kycRequestStatus }) => (
  <>
    <DashboardTitle
      title={<FormattedHTMLMessage tagName="span" id="account-setup.thank-you-title" />}
      text={<FormattedMessage id="account-setup.thank-you-text" />}
    />
    <Panel className={styles.dashboardContentPanel} data-test-id="nominee-kyc-status">
      <StepStatus
        contentTitleComponent={<FormattedMessage id="account-setup.pending-kyc.title" />}
        contentTextComponent={<FormattedHTMLMessage tagName="span" id="account-setup.pending-kyc.text" />}
        mainComponent={<AccountSetupKycPendingComponent />}
        status={getMessageTranslation(kycStatusToTranslationMessage(kycRequestStatus))}
      />
    </Panel>
  </>
);

export const NomineeKycPending = compose<IKycPendingProps,IKycPendingProps>(
  onEnterAction({
    actionCreator:dispatch => dispatch(actions.kyc.kycStartWatching())
  })
)(NomineeKycPendingLayout);
