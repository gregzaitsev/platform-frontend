import * as React from "react";
import { branch, compose, nest, renderComponent, withProps } from "recompose";
import { FormattedMessage, FormattedHTMLMessage } from "react-intl-phraseapp";

import { supportEmail } from "../../config/constants";
import { ERequestStatus } from "../../lib/api/KycApi.interfaces";
import { selectBackupCodesVerified, selectIsUserEmailVerified } from "../../modules/auth/selectors";
import { selectNomineeKycRequestStatus } from "../../modules/kyc/selectors";
import { SelectIsVerificationFullyDone } from "../../modules/selectors";
import { appConnect } from "../../store";
import { withContainer } from "../../utils/withContainer.unsafe";
import { Layout } from "../layouts/Layout";
import { Panel } from "../shared/Panel";
import { SuccessTick } from "../shared/SuccessTick";
import { nomineeAccountSetupSteps } from "./AccountSetupData";
import {
  AccountSetupStep,
  INomineeAccountSetupSteps,
} from "./AccountSetupWizard";
import { IStepComponentProps, prepareSetupAccountSteps } from "./utils";

import * as styles from './NomineeDashboard.module.scss'

interface IStateProps {
  emailVerified: boolean;
  backupCodesVerified: boolean;
  kycRequestStatus: ERequestStatus | undefined;
  verificationIsComplete: boolean;
}

const NomineeDashboardContainer: React.FunctionComponent = ({ children }) =>
  <div data-test-id="nominee-dashboard" className={styles.nomineeDashboardContainer}>
    {children}
  </div>

const NewcomerGreeting = () => <>
  <h1>
    <FormattedMessage id="account-setup.welcome-to-neufund"/>
  </h1>
  <p>
    <FormattedMessage id="account-setup.please-complete-setup"/>
  </p>
</>

const NomineeAccountSetup: React.FunctionComponent<INomineeAccountSetupSteps> = ({
  accountSetupStepsData,
}) => (
  <>
    <NewcomerGreeting/>
    <Panel>
      {accountSetupStepsData.map((stepData: IStepComponentProps) => (
        <AccountSetupStep {...stepData} />
      ))}
    </Panel>
  </>
);

const NoTasks = () =>
  <>
    <SuccessTick />
    <h2><FormattedMessage id="nominee-dashboard.no-tasks-title"/></h2>
    <p><FormattedMessage id="nominee-dashboard.no-tasks-text"/></p>
  </>

const Notification = () =>
  <div className={styles.notification}>
    <FormattedMessage id="account-setup.thank-you"/>
    <FormattedHTMLMessage
      tagName="span" id="account-setup.please-wait-for-confirmation"
      values={{ support: supportEmail }}
    />
  </div>


const NomineeAccountSetupKycPending = () =>
  <>
    <Notification/>
    <NomineeDashboardTasks/>
  </>

interface INomineeTask {
  key: string
}

const NomineeDashboardTasks:React.FunctionComponent<{nomineeTasks?:INomineeTask[]}> = ({ nomineeTasks }) =>
  <Panel className={styles.dashboardContentPanel}>
    {!nomineeTasks
      ? <NoTasks/>
      : () => <>tasks</>
    }
  </Panel>

export const NomineeDashboard = compose<INomineeAccountSetupSteps, {}>(
  withContainer(nest(Layout, NomineeDashboardContainer)),
  appConnect<IStateProps>({
    stateToProps: state => ({
      emailVerified: selectIsUserEmailVerified(state.auth),
      backupCodesVerified: selectBackupCodesVerified(state),
      kycRequestStatus: selectNomineeKycRequestStatus(state),
      verificationIsComplete: SelectIsVerificationFullyDone(state),
    }),
  }),
  /*TODO: the after-setup logic of nominee dashboard is not entirely clear yet.
       Most likely when I sort out the component structure these two branches will be merged in one */
  branch<IStateProps>(
    props => props.kycRequestStatus === ERequestStatus.PENDING,
    renderComponent(NomineeAccountSetupKycPending),
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
