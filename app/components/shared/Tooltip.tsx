import * as cn from "classnames";
import * as React from "react";

import { CommonHtmlProps, TTranslatedString } from "../../types";
import { InlineIcon } from "./InlineIcon";

import * as icon from "../../assets/img/inline_icons/icon_questionmark.svg";
import * as styles from "./Tooltip.module.scss";

interface IProps {
  content: TTranslatedString;
  alignLeft?: boolean;
}

export const Tooltip: React.SFC<IProps & CommonHtmlProps> = ({ content, className, alignLeft }) => (
  <span className={cn(className, styles.tooltipWrapper)} onClick={e => e.preventDefault()}>
    <span className={styles.tooltip}>
      <InlineIcon svgIcon={icon} />
    </span>
    <p className={cn(styles.tooltipText, alignLeft ? styles.alignLeft : styles.alignCenter)}>
      {content}
    </p>
  </span>
);
