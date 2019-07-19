import * as cn from "classnames";
import * as React from "react";
import { FormattedMessage } from "react-intl-phraseapp";

import { Panel } from "../shared/Panel";
import { IStepComponentProps } from "./utils";

import * as styles from "./NomineeDashboard.module.scss";

interface IStepTickerProps {
  done: boolean;
  active: boolean;
}

export interface INomineeAccountSetupSteps {
  accountSetupStepsData: IStepComponentProps[];
}

const StepTicker: React.FunctionComponent<IStepTickerProps> = ({ done, active }) => {
  if (done) {
    return <>x</>;
  } else if (active) {
    return <>v</>;
  } else {
    return <>0</>;
  }
};

export class AccountSetupStep extends React.Component<IStepComponentProps, { isOpen: boolean }> {
  state = {
    isOpen: this.props.isActive,
  };

  toggleOpen = () => {
    this.setState(s => ({ isOpen: !s.isOpen }));
  };

  render(): React.ReactNode {
    const { done, isActive, title, component } = this.props;
    return (
      <div className={styles.accountSetupStepWrapper}>
        <div className={styles.ticker}>
          <StepTicker done={done} active={isActive} />
        </div>
        <div
          className={styles.title}
          onClick={this.props.done || this.props.isActive ? this.toggleOpen : undefined}
        >
          {title}
        </div>
        <span className={styles.line} />
        <div className={cn(styles.component, { [styles.open]: this.state.isOpen })}>
          {component}
        </div>
      </div>
    );
  }
}

export const AccountSetupContainer: React.FunctionComponent = ({ children }) => (
  <div data-test-id="nominee-dashboard">
    <h1>
      <FormattedMessage id="account-setup.welcome-to-neufund" />
    </h1>
    <p>
      <FormattedMessage id="account-setup.please-complete-setup" />
    </p>
    <Panel>{children}</Panel>
  </div>
);
