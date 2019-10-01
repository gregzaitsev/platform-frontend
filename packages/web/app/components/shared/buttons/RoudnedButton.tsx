import * as cn from "classnames";
import * as React from "react";

import { TDataTestId } from "../../../types";
import { Button, IButtonProps } from "./Button";

import * as styles from "./RoundedButton.module.scss";

const RoundedButton: React.ForwardRefExoticComponent<
  { children?: React.ReactNode } & IButtonProps & React.RefAttributes<HTMLButtonElement>
> = React.forwardRef<HTMLButtonElement, IButtonProps & TDataTestId>((props, ref) => (
  <Button {...props} ref={ref} className={cn(props.className, styles.rounded)}>
    {props.children}
  </Button>
));

export { RoundedButton };
