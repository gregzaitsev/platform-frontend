import * as React from "react";
import { FormattedMessage } from "react-intl-phraseapp";
import { branch, compose, nest, renderComponent, renderNothing, withProps } from "recompose";

import { ERequestStatus } from "../../lib/api/KycApi.interfaces";
import { selectBackupCodesVerified, selectIsUserEmailVerified } from "../../modules/auth/selectors";
import { selectNomineeKycRequestStatus } from "../../modules/kyc/selectors";
import { SelectIsVerificationFullyDone } from "../../modules/selectors";
import { appConnect } from "../../store";
import { TTranslatedString } from "../../types";
import { withContainer } from "../../utils/withContainer.unsafe";
import { Layout } from "../layouts/Layout";
import { Panel } from "../shared/Panel";
import { SuccessTick } from "../shared/SuccessTick";
import { nomineeAccountSetupSteps } from "./AccountSetupData";
import { AccountSetupStep, INomineeAccountSetupSteps } from "./AccountSetupWizard";
import { NomineeKycPending } from "./NomineeKycPending";
import { IStepComponentProps, prepareSetupAccountSteps } from "./utils";

import * as styles from "./NomineeDashboard.module.scss";

interface IStateProps {
  emailVerified: boolean;
  backupCodesVerified: boolean;
  kycRequestStatus: ERequestStatus;
  verificationIsComplete: boolean;
}

interface INomineeTask {
  key: string;
}

const NomineeDashboardContainer: React.FunctionComponent = ({ children }) => (
  <div data-test-id="nominee-dashboard" className={styles.nomineeDashboardContainer}>
    {children}
  </div>
);

interface IDashboardTitleProps {
  title: TTranslatedString;
  text: TTranslatedString;
}

export const DashboardTitle: React.FunctionComponent<IDashboardTitleProps> = ({ title, text }) => (
  <div className={styles.dashboardTitleWrapper}>
    <h1 className={styles.dashboardTitle}>{title}</h1>
    <p className={styles.dashboardText}>{text}</p>
  </div>
);

const NomineeAccountSetup: React.FunctionComponent<INomineeAccountSetupSteps> = ({
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

const NoTasks = () => (
  <>
    <SuccessTick />
    <h2 className={styles.dashboardTitle}>
      <FormattedMessage id="nominee-dashboard.no-tasks-title" />
    </h2>
    <p className={styles.dashboardText}>
      <FormattedMessage id="nominee-dashboard.no-tasks-text" />
    </p>
  </>
);

export const NomineeDashboardTasks: React.FunctionComponent<{ nomineeTasks?: INomineeTask[] }> = ({
  nomineeTasks,
}) => (
  <Panel className={styles.dashboardContentPanel}>
    {!nomineeTasks ? <NoTasks /> : () => <>tasks</>}
  </Panel>
);

export const NomineeDashboard = compose<INomineeAccountSetupSteps, {}>(
  withContainer(nest(Layout, NomineeDashboardContainer)),
  appConnect<IStateProps | null>({
    stateToProps: state => {
      const kycRequestStatus = selectNomineeKycRequestStatus(state);
      if (kycRequestStatus !== undefined) {
        return ({
          emailVerified: selectIsUserEmailVerified(state.auth),
          backupCodesVerified: selectBackupCodesVerified(state),
          kycRequestStatus,
          verificationIsComplete: SelectIsVerificationFullyDone(state),
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
      [ERequestStatus.PENDING, ERequestStatus.IGNORED, ERequestStatus.REJECTED].includes(props.kycRequestStatus),
    renderComponent(
      withProps<{ kycRequestStatus: ERequestStatus }, IStateProps>(({ kycRequestStatus }) =>
        ({ kycRequestStatus }))(NomineeKycPending)),
  ),
  branch<IStateProps>(
    props => props.verificationIsComplete,
    renderComponent(NomineeDashboardTasks),
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
