import * as React from "react";
import { FormattedMessage } from "react-intl-phraseapp";
import { branch, compose, renderComponent, renderNothing, withProps } from "recompose";

import { AccountSetupStep, INomineeAccountSetupSteps } from "./AccountSetupWizard";
import { Panel } from "../shared/Panel";
import { IStepComponentProps, prepareSetupAccountSteps } from "./utils";
import { DashboardTitle } from "./NomineeDashboard";
import { appConnect } from "../../store";
import { selectNomineeKycRequestStatus } from "../../modules/kyc/selectors";
import { selectBackupCodesVerified, selectIsUserEmailVerified } from "../../modules/auth/selectors";
import { ERequestStatus } from "../../lib/api/KycApi.interfaces";
import { NomineeKycPending } from "./NomineeKycPending";
import { nomineeAccountSetupSteps } from "./AccountSetupData";

import * as styles from "./NomineeDashboard.module.scss";

interface IStateProps {
  emailVerified: boolean;
  backupCodesVerified: boolean;
  kycRequestStatus: ERequestStatus;
}

const NomineeAccountSetupLayout: React.FunctionComponent<INomineeAccountSetupSteps> = ({
  accountSetupStepsData,
}) => (
  <>
    <DashboardTitle
      title={<FormattedMessage id="account-setup.welcome-to-neufund" />}
      text={<FormattedMessage id="account-setup.please-complete-setup" />}
    />
    <Panel className={styles.accountSetupWrapper}>
      {accountSetupStepsData.map((stepData: IStepComponentProps) => (
        <AccountSetupStep {...stepData} />
      ))}
    </Panel>
  </>
);


export const NomineeAccountSetup = compose<INomineeAccountSetupSteps, {}>(
  // withContainer(nest(Layout, NomineeDashboardContainer)),
  appConnect<IStateProps | null>({
    stateToProps: state => {
      const kycRequestStatus = selectNomineeKycRequestStatus(state);
      if (kycRequestStatus !== undefined) {
        return ({
          emailVerified: selectIsUserEmailVerified(state.auth),
          backupCodesVerified: selectBackupCodesVerified(state),
          kycRequestStatus,
        })
      } else {
        return null
      }
    }
  }),
  branch<IStateProps | null>(props => props === null, renderNothing),

  /*TODO: the after-setup logic of nominee dashboard is not entirely clear yet.
       Most likely when I sort out the component structure these two branches will be merged in one */
  branch<IStateProps>(
    props =>
      props.emailVerified &&
      props.backupCodesVerified &&
      [ERequestStatus.PENDING, ERequestStatus.IGNORED, ERequestStatus.REJECTED].includes(props.kycRequestStatus),
    renderComponent(
      withProps<{ kycRequestStatus: ERequestStatus }, IStateProps>(({ kycRequestStatus }) =>
        ({ kycRequestStatus }))(NomineeKycPending)),
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
)(NomineeAccountSetupLayout);
