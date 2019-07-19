import * as React from "react";
import { branch, compose, nest, renderComponent, withProps } from "recompose";

import { ERequestStatus } from "../../lib/api/KycApi.interfaces";
import { selectBackupCodesVerified, selectIsUserEmailVerified } from "../../modules/auth/selectors";
import { selectNomineeKycRequestStatus } from "../../modules/kyc/selectors";
import { SelectIsVerificationFullyDone } from "../../modules/selectors";
import { appConnect } from "../../store";
import { withContainer } from "../../utils/withContainer.unsafe";
import { Layout } from "../layouts/Layout";
import { nomineeAccountSetupSteps } from "./AccountSetupData";
import { AccountSetupContainer, AccountSetupStep, INomineeAccountSetupSteps } from "./AccountSetupWizard";
import {  IStepComponentProps, prepareSetupAccountSteps } from "./utils";

const NomineeAccountSetup: React.FunctionComponent<INomineeAccountSetupSteps> = ({
  accountSetupStepsData
}) =>
  <>
    {accountSetupStepsData.map((stepData: IStepComponentProps) =>
      <AccountSetupStep {...stepData} />)}
  </>;

export const NomineeDashboard = compose<INomineeAccountSetupSteps, {}>(
  withContainer(nest(Layout, AccountSetupContainer)),
  appConnect({
    stateToProps: state => ({
      emailVerified: selectIsUserEmailVerified(state.auth),
      backupCodesVerified: selectBackupCodesVerified(state),
      kycRequestStatus: selectNomineeKycRequestStatus(state),
      verificationIsComplete: SelectIsVerificationFullyDone(state),
    })
  }),
  branch<any>(props => props.kycRequestStatus === ERequestStatus.PENDING, renderComponent(() => <>kyc pending</>)),
  branch<any>(props => props.verificationIsComplete, renderComponent(() => <>no tasks for you today</>)),
  withProps<any, any>(({ emailVerified, backupCodesVerified, kycRequestStatus }: any) =>
    ({
      accountSetupStepsData: prepareSetupAccountSteps(
        nomineeAccountSetupSteps(emailVerified, backupCodesVerified, kycRequestStatus !== ERequestStatus.DRAFT)
      )
    })),
)(NomineeAccountSetup);
