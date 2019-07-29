import * as React from "react";

import { Panel } from "../shared/Panel";
import { EKycRequestStatus } from "../../lib/api/KycApi.interfaces";

import * as styles from "./NomineeDashboard.module.scss";
import { getMessageTranslation } from "../translatedMessages/messages";
import { kycStatusToTranslationMessage } from "../../modules/kyc/utils";

interface IStepStatus {
  contentTitleComponent: React.ReactChild,
  contentTextComponent: React.ReactChild,
  status: EKycRequestStatus,
  mainComponent: React.ReactChild
}

export const StepStatus: React.FunctionComponent<IStepStatus> = ({
  contentTitleComponent,
  contentTextComponent,
  status,
  mainComponent
}) =>
  <>
    <Panel className={styles.dashboardContentPanel} data-test-id="nominee-kyc-status">
      {contentTitleComponent &&
      <h1 className={styles.dashboardContentTitle}>
        {contentTitleComponent}
        {status && <>{" "}<span className={styles.status}>{getMessageTranslation(kycStatusToTranslationMessage(status))}</span></>}
      </h1>}
      {contentTextComponent &&
      <p className={styles.dashboardContentText}>
        {contentTextComponent}
      </p>}
      {mainComponent}
    </Panel>
  </>;
