import * as cn from "classnames";
import * as React from "react";

import { InlineIcon } from "../shared/icons/InlineIcon";
import { EAccountSetupStepState, IStepComponentProps } from "./utils";

import * as styles from "./NomineeDashboard.module.scss";
import * as checkMark from "../../assets/img/inline_icons/icon_check.svg";

interface IStepTickerProps {
  stepState: EAccountSetupStepState;
  number: number;
}

interface IExternalProps {
  isLast: boolean
}

export interface IAccountSetupStepState {
  isOpen: boolean
}

export interface INomineeAccountSetupSteps {
  accountSetupStepsData: IStepComponentProps[];
}

const StepTicker: React.FunctionComponent<IStepTickerProps> = ({ stepState, number }) => {
  switch (stepState) {
    case EAccountSetupStepState.ACTIVE:
      return <div className={cn(styles.ticker, styles.active)}>{number}</div>;
    case EAccountSetupStepState.DONE:
      return <div className={cn(styles.ticker, styles.done)}>
        <InlineIcon svgIcon={checkMark} />
      </div>;
    case EAccountSetupStepState.NOT_DONE:
    default:
      return <div className={styles.ticker}>{number}</div>;
  }
};

export class AccountSetupStep extends React.Component<IStepComponentProps & IExternalProps, IAccountSetupStepState> {
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
        <div className={styles.title} >
          {title}
        </div>
        {!this.props.isLast && <span className={styles.line}/>}
        {this.state.isOpen
          ? <div className={styles.componentOpen}>
            {component}
          </div>
        : <div className={cn(styles.componentClosed, {[styles.last]:this.props.isLast})}/>
        }
      </div>
    );
  }
}
