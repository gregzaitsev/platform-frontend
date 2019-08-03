import * as React from "react";
import { FormattedHTMLMessage, FormattedMessage } from "react-intl-phraseapp";
import { compose } from "recompose";

import { EKycRequestStatus } from "../../../lib/api/KycApi.interfaces";
import { actions } from "../../../modules/actions";
import { kycStatusToTranslationMessage } from "../../../modules/kyc/utils";
import { onEnterAction } from "../../../utils/OnEnterAction";
import { AccountSetupKycPendingComponent } from "../../settings/kyc-states/AccountSetupKycComponent";
import { Panel } from "../../shared/Panel";
import { getMessageTranslation } from "../../translatedMessages/messages";
import { StepStatus } from "../DashboardStepStatus";
import { DashboardTitle } from "../NomineeDashboard";

import * as styles from "../NomineeDashboard.module.scss";
import { onLeaveAction } from "../../../utils/OnLeaveAction";

interface IKycPendingProps {
  kycRequestStatus: EKycRequestStatus;
  emailVerified: boolean;
  backupCodesVerified: boolean;
}

export const AccountSetupKycPendingLayout: React.FunctionComponent<IKycPendingProps> = ({
  kycRequestStatus,
}) => (
  <>
    <DashboardTitle
      title={<FormattedHTMLMessage tagName="span" id="account-setup.thank-you-title" />}
      text={<FormattedMessage id="account-setup.thank-you-text" />}
    />
    <Panel className={styles.dashboardContentPanel} data-test-id="nominee-kyc-status">
      <StepStatus
        contentTitleComponent={<FormattedMessage id="account-setup.pending-kyc.title" />}
        contentTextComponent={
          <FormattedHTMLMessage tagName="span" id="account-setup.pending-kyc.text" />
        }
        mainComponent={<AccountSetupKycPendingComponent />}
        status={getMessageTranslation(kycStatusToTranslationMessage(kycRequestStatus))}
      />
    </Panel>
  </>
);

export const AccountSetupKycPending = compose<IKycPendingProps, IKycPendingProps>(
  onEnterAction({
    actionCreator: dispatch => dispatch(actions.kyc.kycStartWatching()),
  }),
  onLeaveAction({
    actionCreator: dispatch => dispatch(actions.kyc.kycStopWatching()),
  })
)(AccountSetupKycPendingLayout);
