import * as React from "react";
import { branch, compose, renderComponent, renderNothing, withProps } from "recompose";
import { FormattedMessage } from "react-intl-phraseapp";

import { EKycRequestStatus } from "../../../lib/api/KycApi.interfaces";
import { selectBackupCodesVerified, selectIsUserEmailVerified } from "../../../modules/auth/selectors";
import { selectKycRequestStatus } from "../../../modules/kyc/selectors";
import { appConnect } from "../../../store";
import { nomineeAccountSetupSteps } from "./AccountSetupData";
import { AccountSetupStep, INomineeAccountSetupSteps } from "./AccountSetupFlow";
import { AccountSetupKycPending } from "./AccountSetupKycPending";
import { IStepComponentProps, prepareSetupAccountSteps } from "../utils";
import { DashboardTitle } from "../NomineeDashboard";
import { Panel } from "../../shared/Panel";

import * as styles from "../NomineeDashboard.module.scss";

interface IStateProps {
  emailVerified: boolean;
  backupCodesVerified: boolean;
  kycRequestStatus: EKycRequestStatus;
}

export interface INomineeAccountSetupSteps {
  accountSetupStepsData: IStepComponentProps[];
}


export const AccountSetupLayout: React.FunctionComponent<INomineeAccountSetupSteps> = ({ accountSetupStepsData }) =>
  <>
    <DashboardTitle
      title={<FormattedMessage id="account-setup.welcome-to-neufund" />}
      text={<FormattedMessage id="account-setup.please-complete-setup" />}
    />
    <Panel className={styles.accountSetupContainer}>
      {accountSetupStepsData.map((stepData: IStepComponentProps) => (
        <AccountSetupStep {...stepData} />
      ))}
    </Panel>
  </>

export const AccountSetup = compose<INomineeAccountSetupSteps, {}>(
  appConnect<IStateProps | null>({
    stateToProps: state => {
      const kycRequestStatus = selectKycRequestStatus(state);
      if (kycRequestStatus !== undefined) {
        return {
          emailVerified: selectIsUserEmailVerified(state.auth),
          backupCodesVerified: selectBackupCodesVerified(state),
          kycRequestStatus,
        };
      } else {
        return null;
      }
    },
  }),
  branch<IStateProps | null>(props => props === null, renderNothing),
  branch<IStateProps>(
    props =>
      props.emailVerified &&
      props.backupCodesVerified &&
      [EKycRequestStatus.PENDING, EKycRequestStatus.IGNORED, EKycRequestStatus.REJECTED].includes(
        props.kycRequestStatus,
      ),
    renderComponent(
      withProps<{ kycRequestStatus: EKycRequestStatus }, IStateProps>(({ kycRequestStatus }) => ({
        kycRequestStatus,
      }))(AccountSetupKycPending),
    ),
  ),
  withProps<INomineeAccountSetupSteps, IStateProps>(
    ({ emailVerified, backupCodesVerified, kycRequestStatus }: IStateProps) => ({
      accountSetupStepsData: prepareSetupAccountSteps(
        nomineeAccountSetupSteps(
          emailVerified,
          backupCodesVerified,
          kycRequestStatus !== EKycRequestStatus.DRAFT,
        ),
      ),
    }),
  ),
)(AccountSetupLayout);
