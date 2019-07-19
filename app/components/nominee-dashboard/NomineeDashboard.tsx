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
import {
  AccountSetupContainer,
  AccountSetupStep,
  INomineeAccountSetupSteps,
} from "./AccountSetupWizard";
import { IStepComponentProps, prepareSetupAccountSteps } from "./utils";

interface IStateProps {
  emailVerified: boolean;
  backupCodesVerified: boolean;
  kycRequestStatus: ERequestStatus | undefined;
  verificationIsComplete: boolean;
}

const NomineeAccountSetup: React.FunctionComponent<INomineeAccountSetupSteps> = ({
  accountSetupStepsData,
}) => (
  <>
    {accountSetupStepsData.map((stepData: IStepComponentProps) => (
      <AccountSetupStep {...stepData} />
    ))}
  </>
);

export const NomineeDashboard = compose<INomineeAccountSetupSteps, {}>(
  withContainer(nest(Layout, AccountSetupContainer)),
  appConnect<IStateProps>({
    stateToProps: state => ({
      emailVerified: selectIsUserEmailVerified(state.auth),
      backupCodesVerified: selectBackupCodesVerified(state),
      kycRequestStatus: selectNomineeKycRequestStatus(state),
      verificationIsComplete: SelectIsVerificationFullyDone(state),
    }),
  }),
  branch<IStateProps>(
    props => props.kycRequestStatus === ERequestStatus.PENDING,
    renderComponent(() => <>kyc pending</>),
  ),
  branch<IStateProps>(
    props => props.verificationIsComplete,
    renderComponent(() => <>no tasks for you today</>),
  ),
  withProps<INomineeAccountSetupSteps, IStateProps>(
    ({ emailVerified, backupCodesVerified, kycRequestStatus }: IStateProps) => ({
      accountSetupStepsData: prepareSetupAccountSteps(
        nomineeAccountSetupSteps(
          emailVerified,
          backupCodesVerified,
          kycRequestStatus !== ERequestStatus.DRAFT,
        ),
      ),
    }),
  ),
)(NomineeAccountSetup);
