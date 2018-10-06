import * as cn from "classnames";
import * as React from "react";

import { InlineIcon } from "../InlineIcon";
import { LoadingIndicator } from "../LoadingIndicator";

import * as arrowRight from "../../../assets/img/inline_icons/arrow_right.svg";
import * as closeIcon from "../../../assets/img/inline_icons/close.svg";
import { CommonHtmlProps } from "../../../types";

import * as styles from "./Button.module.scss";

type TButtonLayout = "primary" | "secondary" | "simple";
type TButtonTheme = "dark" | "white" | "brand" | "silver" | "graphite";
type TIconPosition = "icon-before" | "icon-after";

export enum ButtonSize {
  NORMAL = "",
  SMALL = "small",
}

export enum ButtonWidth {
  NORMAL = "",
  WIDE = "wide",
  BLOCK = "block",
}

export interface IGeneralButton {
  onClick?: (event: any) => void;
}

interface IButtonIcon extends IGeneralButton {
  svgIcon: string;
  className?: string;
}

export interface IButtonProps extends IGeneralButton, CommonHtmlProps {
  layout?: TButtonLayout;
  theme?: TButtonTheme;
  disabled?: boolean;
  svgIcon?: string;
  type?: string;
  iconPosition?: TIconPosition;
  size?: ButtonSize;
  width?: ButtonWidth;
  isLoading?: boolean;
}

const Button: React.SFC<IButtonProps> = ({
  children,
  layout,
  theme,
  disabled,
  svgIcon,
  className,
  iconPosition,
  size,
  width,
  isLoading,
  type,
  ...props
}) => (
  <button
    className={cn("button", layout, iconPosition, theme, size, width)}
    disabled={disabled || isLoading}
    type={type}
    {...props}
  >
    <div className={cn(styles.content, className)} tabIndex={-1}>
      {isLoading ? (
        <LoadingIndicator light />
      ) : (
        <>
          {iconPosition === "icon-before" && <InlineIcon svgIcon={svgIcon || ""} />}
          {children}
          {iconPosition === "icon-after" && <InlineIcon svgIcon={svgIcon || ""} />}
        </>
      )}
    </div>
  </button>
);

Button.defaultProps = {
  layout: "primary",
  theme: "dark",
  type: "button",
  disabled: false,
  size: ButtonSize.NORMAL,
  width: ButtonWidth.NORMAL,
};

const ButtonIcon: React.SFC<IButtonIcon> = ({ onClick, className, ...props }) => (
  <div className={cn(styles.buttonIcon, className)} onClick={onClick}>
    <InlineIcon {...props} width="20px" height="20px" />
  </div>
);

const ButtonClose: React.SFC<IGeneralButton> = props => (
  <ButtonIcon {...props} svgIcon={closeIcon} />
);

const ButtonArrowRight: React.SFC<IButtonProps> = props => (
  <Button {...props} layout="secondary" iconPosition="icon-after" svgIcon={arrowRight} />
);

export { ButtonIcon, ButtonClose, ButtonArrowRight, Button };