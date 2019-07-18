import * as React from "react";
import { branch, compose, nest, renderComponent, withProps } from "recompose";
import { FormattedMessage } from "react-intl-phraseapp";

import { withContainer } from "../../utils/withContainer.unsafe";
import { Layout } from "../layouts/Layout";
import { appConnect } from "../../store";
import { SelectIsVerificationFullyDone } from "../../modules/selectors";
import { selectBackupCodesVerified, selectIsUserEmailVerified } from "../../modules/auth/selectors";
import { selectNomineeKycRequestStatus } from "../../modules/kyc/selectors";
import { ERequestStatus } from "../../lib/api/KycApi.interfaces";
import { Panel } from "../shared/Panel";


interface IStepComponentProps {
  done: boolean;
  isOpen: boolean;
  title: JSX.Element;
  component: JSX.Element;
}

interface INomineeAccountSetupSteps {
  accountSetupStepsData: IStepComponentProps[];
}

interface IAccountSetupStepData {
  key: string,
  conditionCompleted: boolean,
  title: JSX.Element,
  component: JSX.Element
}

const AccountSetupStep: React.FunctionComponent<IStepComponentProps> = ({ done, title, isOpen, component }) => {
  return <div className="acocunt-steup-step-wrapper">
    <div className="step-ticker">{done ? "x" : "0"}</div>
    <div className="step-title">{title}</div>
    <div className={isOpen ? "open" : "closed"}>{component}</div>
  </div>
};

const NomineeDashboardLayout: React.FunctionComponent<INomineeAccountSetupSteps> = ({
  accountSetupStepsData
}) => {
  return <>
    {accountSetupStepsData.map((stepData: IStepComponentProps) => {
      return <AccountSetupStep {...stepData} />;
    })}
  </>
};


const nomineeAccountSetupSteps = (emailVerified: boolean, backupCodesVerified: boolean, kycDone: boolean): IAccountSetupStepData[] => [
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
    conditionCompleted: kycDone,
    title: <FormattedMessage id="account-setup.verify-your-company" />,
    component: <>start kyc</>
  }
];

const prepareSetupAccountSteps = (data: IAccountSetupStepData[]): IStepComponentProps[] => {

  const newData = data.reduce((acc: { firstOpenElement: string | null, data: IStepComponentProps[] }, stepData: IAccountSetupStepData) => {

      const isOpen = !stepData.conditionCompleted && acc.firstOpenElement === null;
      console.log(stepData.key,!stepData.conditionCompleted , acc.firstOpenElement === null)
      const stepComponentProps = {
        done: stepData.conditionCompleted,
        isOpen: isOpen,
        key: stepData.key,
        title: stepData.title,
        component: stepData.component,
      };
      acc.data.push(stepComponentProps);
      acc.firstOpenElement = isOpen ? stepData.key : acc.firstOpenElement;
      return acc;
    },
    { firstOpenElement: null, data: [] }
  );
  console.log(newData.data);
  return newData.data
};

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
  branch(props => props.kycRequestStatus === ERequestStatus.PENDING, renderComponent(() => <>kyc pending</>)),
  branch(props => props.verificationIsComplete, renderComponent(() => <>no tasks for you today</>)),
  withProps(({ emailVerified, backupCodesVerified, kycRequestStatus }) => {
    return ({
      accountSetupStepsData: prepareSetupAccountSteps(
        nomineeAccountSetupSteps(emailVerified, backupCodesVerified, kycRequestStatus !== ERequestStatus.DRAFT)
      )
    })
  }),
)(NomineeDashboardLayout);
