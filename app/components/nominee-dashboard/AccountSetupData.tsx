import { FormattedMessage } from "react-intl-phraseapp";
import * as React from "react";

import { IAccountSetupStepData } from "./utils";
import { VerifyEmailComponent } from "../settings/verify-email/VerifyEmailWidget";

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
    component: <>backup codes</>
  },
  {
    key: 'startKyc',
    conditionCompleted: kycCompleted,
    title: <FormattedMessage id="account-setup.verify-your-company" />,
    component: <>start kyc</>
  }
];


