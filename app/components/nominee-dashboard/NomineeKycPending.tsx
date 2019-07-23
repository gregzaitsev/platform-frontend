import * as React from "react";
import { FormattedHTMLMessage, FormattedMessage } from "react-intl-phraseapp";

import { AccountSetupKycPendingComponent } from "../settings/kyc-states/KycStatusWidget";
import { Panel } from "../shared/Panel";
import { DashboardTitle } from "./NomineeDashboard";

import * as styles from "./NomineeDashboard.module.scss";

export const NomineeKycPending: React.FunctionComponent = () => (
  <>
    <DashboardTitle
      title={<FormattedHTMLMessage tagName="span" id="account-setup.thank-you-title" />}
      text={<FormattedMessage id="account-setup.thank-you-text" />}
    />
    <Panel className={styles.dashboardContentPanel} data-test-id="nominee-kyc-pending">
      <h1 className={styles.dashboardContentTitle}>
        <FormattedMessage id="account-setup.pending-kyc.title" />{" "}
        <span className={styles.status}>pending</span>
      </h1>
      <p className={styles.dashboardContentText}>
        <FormattedHTMLMessage tagName="span" id="account-setup.pending-kyc.text" />
      </p>
      <AccountSetupKycPendingComponent />
    </Panel>
  </>
);
