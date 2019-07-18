import * as React from "react";
import { branch, compose, nest, renderComponent, withProps } from "recompose";
import { FormattedMessage } from "react-intl-phraseapp";
import * as cn from 'classnames'

import { withContainer } from "../../utils/withContainer.unsafe";
import { Layout } from "../layouts/Layout";
import { appConnect } from "../../store";
import { SelectIsVerificationFullyDone } from "../../modules/selectors";
import { selectBackupCodesVerified, selectIsUserEmailVerified } from "../../modules/auth/selectors";
import { selectNomineeKycRequestStatus } from "../../modules/kyc/selectors";
import { ERequestStatus } from "../../lib/api/KycApi.interfaces";
import { Panel } from "../shared/Panel";
import { IAccountSetupStepData, IStepComponentProps, prepareSetupAccountSteps } from "./utils";

import * as styles from './NomineeDashboard.module.scss'

interface INomineeAccountSetupSteps {
  accountSetupStepsData: IStepComponentProps[];
}

interface IStepTickerProps {
  done: boolean,
  active: boolean,
}

const StepTicker: React.FunctionComponent<IStepTickerProps> = ({ done, active }) => {
  if (done) {
    return <>x</>
  } else if (active) {
    return <>v</>
  } else {
    return <>0</>
  }
};

class AccountSetupStep extends React.Component<IStepComponentProps, { isOpen: boolean }> {
  state = {
    isOpen: this.props.isActive
  };

  toggleOpen = () => {
    this.setState(s => ({ isOpen: !s.isOpen }))
  };

  render() {
    const { done, isActive, title, component } = this.props;
    return <div className={styles.accountSetupStepWrapper}>
      <div className={styles.ticker}>
        <StepTicker done={done} active={isActive} />
      </div>
      <div
        className={styles.title}
        onClick={(this.props.done || this.props.isActive) ? this.toggleOpen : undefined}
      >
        {title}
      </div>
      <span className={styles.line} />
      <div className={cn(styles.component, { [styles.open]: this.state.isOpen })}>{component}</div>
    </div>
  }
}

const NomineeDashboardLayout: React.FunctionComponent<INomineeAccountSetupSteps> = ({
  accountSetupStepsData
}) => {
  return <>
    {accountSetupStepsData.map((stepData: IStepComponentProps) => {
      return <AccountSetupStep {...stepData} />;
    })}
  </>
};

const nomineeAccountSetupSteps = (emailVerified: boolean, backupCodesVerified: boolean, kycCompleted: boolean): IAccountSetupStepData[] => [
  {
    key: 'verifyEmail',
    conditionCompleted: emailVerified,
    title: <FormattedMessage id="account-setup.verify-email" />,
    component: <>email</>
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


const AccountSetupContainer: React.FunctionComponent = ({ children }) =>
  <div data-test-id="nominee-dashboard">
    <h1>
      <FormattedMessage id="account-setup.welcome-to-neufund" />
    </h1>
    <p>
      <FormattedMessage id="account-setup.please-complete-setup" />
    </p>
    <Panel>
      {children}
    </Panel>
  </div>;


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
  withProps<any, any>(({ emailVerified, backupCodesVerified, kycRequestStatus }: any) => {
    return ({
      accountSetupStepsData: prepareSetupAccountSteps(
        nomineeAccountSetupSteps(emailVerified, backupCodesVerified, kycRequestStatus !== ERequestStatus.DRAFT)
      )
    })
  }),
)(NomineeDashboardLayout);
