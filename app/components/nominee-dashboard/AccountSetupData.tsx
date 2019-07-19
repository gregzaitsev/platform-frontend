import * as React from "react";
import { FormattedMessage } from "react-intl-phraseapp";

import { BackupSeedComponent } from "../settings/backup-seed/BackupSeedWidget";
import { VerifyEmailComponent } from "../settings/verify-email/VerifyEmailWidget";
import { IAccountSetupStepData } from "./utils";

export const nomineeAccountSetupSteps = (emailVerified: boolean, backupCodesVerified: boolean, kycCompleted: boolean): IAccountSetupStepData[] => [
  {
    key: 'verifyEmail',
    conditionCompleted: emailVerified,
    title: <FormattedMessage id="account-setup.verify-email" />,
    component: <VerifyEmailComponent />
  },
  {
    key: 'verifyBackupCodes',
    conditionCompleted: backupCodesVerified,
    title: <FormattedMessage id="account-setup.verify-backup-codes" />,
    component: <BackupSeedComponent />
  },
  {
    key: 'startKyc',
    conditionCompleted: kycCompleted,
    title: <FormattedMessage id="account-setup.verify-your-company" />,
    component: <>start kyc</>
  }
];


