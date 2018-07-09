import * as React from "react";
import { Col } from "reactstrap";

import { TRequestStatus } from "../../lib/api/KycApi.interfaces";
import { selectBackupCodesVerified, selectVerifiedUserEmail } from "../../modules/auth/selectors";
import { BackupSeedWidget } from "./backupSeed/BackupSeedWidget";
import { KycStatusWidget } from "./kycStates/KycStatusWidget";
import { VerifyEmailWidget } from "./verifyEmail/VerifyEmailWidget";

interface IProps {
  isDynamic: boolean;
  isLightWallet?: boolean;
  verifiedEmail?: string;
  backupCodesVerified?: boolean;
  requestStatus?: TRequestStatus;
}

export const SettingsWidgets: React.SFC<IProps> = ({
  isLightWallet,
  backupCodesVerified,
  verifiedEmail,
  isDynamic,
  requestStatus,
}) => {
  let settingsStepCounter = 0;
  return (
    <>
      {(!isDynamic || !verifiedEmail) && (
        <Col lg={4} xs={12}>
          <VerifyEmailWidget step={++settingsStepCounter} />
        </Col>
      )}
      {(!isDynamic || !backupCodesVerified) &&
        isLightWallet && (
          <Col lg={4} xs={12}>
            <BackupSeedWidget step={++settingsStepCounter} />
          </Col>
        )}
      {(!isDynamic || requestStatus !== "Accepted") && (
        <Col lg={4} xs={12}>
          <KycStatusWidget step={++settingsStepCounter} />
        </Col>
      )}
    </>
  );
};
