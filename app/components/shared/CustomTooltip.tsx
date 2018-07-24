import * as cn from "classnames";
import * as React from "react";
import { Tooltip, TooltipProps } from 'reactstrap'

import { CommonHtmlProps } from "../../types";

import * as icon from "../../assets/img/inline_icons/icon_questionmark.svg";
import * as styles from "./CustomTooltip.module.scss";

interface IProps {
}

export class CustomTooltip extends React.Component<TooltipProps & IProps> {
  state = {
    tooltipOpen: false
  }

  toggle = () => {
    if (!this.props.isOpen) {
      this.setState({
        tooltipOpen: !this.state.tooltipOpen
      });
    }
  }

  componentDidMount (): void {
    if (this.props.isOpen) {
      this.setState({
        tooltipOpen: true
      });
    }
  }

  render (): React.ReactChild {
    const { target, className, isOpen, toggle, children, ...props } = this.props
    return (
      <>
        <Tooltip className={styles.tooltip} target={target} isOpen={this.state.tooltipOpen} toggle={toggle || this.toggle} {...props}>
          {children}
        </Tooltip>
      </>
    );
  }
}
