import * as cn from "classnames";
import * as React from "react";

import * as styles from "./NomineeDashboard.module.scss";
import { EAccountSetupStepState, IStepComponentProps } from "./utils";


interface IStepTickerProps {
  stepState: EAccountSetupStepState;
  number: number;
}


export interface INomineeAccountSetupSteps {
  accountSetupStepsData: IStepComponentProps[];
}

export interface IAccountSetupStepState {
  isOpen: boolean
}

const StepTicker: React.FunctionComponent<IStepTickerProps> = ({ stepState, number }) => {
  switch (stepState) {
    case EAccountSetupStepState.ACTIVE:
      return <div className={cn(styles.ticker, styles.active)}>{number}</div>;
    case EAccountSetupStepState.DONE:
      return <div className={cn(styles.ticker, styles.done)}>v</div>;
    case EAccountSetupStepState.NOT_DONE:
    default:
      return <div className={styles.ticker}>{number}</div>;
  }
};

export class AccountSetupStep extends React.Component<IStepComponentProps, IAccountSetupStepState> {
  state = {
    isOpen: this.props.stepState === EAccountSetupStepState.ACTIVE,
  };

  toggleOpen = () => {
    this.setState(s => ({ isOpen: !s.isOpen }));
  };

  render(): React.ReactNode {
    const { stepState, title, component, number } = this.props;
    return (
      <div className={styles.accountSetupStepWrapper}>
          <StepTicker stepState={stepState} number={number}/>
        <div
          className={styles.title}
          onClick={
            stepState === EAccountSetupStepState.DONE || stepState === EAccountSetupStepState.ACTIVE
              ? this.toggleOpen
              : undefined
          }
        >
          {title}
        </div>
        <span className={styles.line}/>
        {this.state.isOpen
          ? <div className={styles.componentOpen}>
            {component}
          </div>
        : <div className={styles.componentClosed}/>

        }
      </div>
    );
  }
}
//
// export const AccountSetupContainer: React.FunctionComponent = ({ children }) => (
//   <div data-test-id="nominee-dashboard">
//     <h1>
//       <FormattedMessage id="account-setup.welcome-to-neufund"/>
//     </h1>
//     <p>
//       <FormattedMessage id="account-setup.please-complete-setup"/>
//     </p>
//     <Panel>{children}</Panel>
//   </div>
// );
