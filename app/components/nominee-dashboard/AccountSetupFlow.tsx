import * as cn from "classnames";
import * as React from "react";
import { FormattedMessage } from "react-intl-phraseapp";

import { InlineIcon } from "../shared/icons/InlineIcon";
import { Panel } from "../shared/Panel";
import { DashboardTitle } from "./NomineeDashboard";
import { EAccountSetupStepState, IStepComponentProps } from "./utils";

import * as checkMark from "../../assets/img/inline_icons/icon_check.svg";
import * as styles from "./NomineeDashboard.module.scss";

interface IStepTickerProps {
  stepState: EAccountSetupStepState;
  number: number;
}

interface IExternalProps {
  isLast: boolean;
}

export interface INomineeAccountSetupSteps {
  accountSetupStepsData: IStepComponentProps[];
}

const StepTicker: React.FunctionComponent<IStepTickerProps> = ({ stepState, number }) => {
  switch (stepState) {
    case EAccountSetupStepState.ACTIVE:
      return <div className={cn(styles.ticker, styles.active)}>{number}</div>;
    case EAccountSetupStepState.DONE:
      return (
        <div className={cn(styles.ticker, styles.done)}>
          <InlineIcon svgIcon={checkMark} />
        </div>
      );
    case EAccountSetupStepState.NOT_DONE:
    default:
      return <div className={styles.ticker}>{number}</div>;
  }
};

const AccountSetupStep: React.FunctionComponent<IStepComponentProps & IExternalProps> = ({
  isLast,
  stepState,
  title,
  component,
  number,
}) => (
  <div className={styles.accountSetupStepWrapper}>
    <StepTicker stepState={stepState} number={number} />

    <div className={styles.title}>{title}</div>
    {!isLast && <span className={styles.line} />}

    {stepState === EAccountSetupStepState.ACTIVE ? (
      <div className={styles.componentOpen}>{component}</div>
    ) : (
      <div className={cn(styles.componentClosed, { [styles.last]: isLast })} />
    )}
  </div>
);

export { AccountSetupStep };

export const AccountSetupLayout: React.FunctionComponent<INomineeAccountSetupSteps> = ({
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
