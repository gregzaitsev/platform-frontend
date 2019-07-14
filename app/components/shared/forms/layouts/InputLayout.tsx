import * as cn from "classnames";
import * as React from "react";
import { Input, InputGroup, InputGroupAddon, InputProps } from "reactstrap";

import { CommonHtmlProps, Omit, TDataTestId, TTranslatedString } from "../../../../types";
import { FormFieldError, generateErrorId } from "../fields/FormFieldError";
import { withCountedCharacters } from "../fields/utils.unsafe";

import * as styles from "../fields/FormStyles.module.scss";

enum EInputSize {
  NORMAL = "",
  SMALL = "sm",
}

interface IExternalProps {
  addonStyle?: string;
  charactersLimit?: number;
  errorMsg?: TTranslatedString;
  ignoreTouched?: boolean;
  invalid?: boolean;
  maxLength?: number;
  name: string;
  prefix?: TTranslatedString;
  size?: EInputSize;
  suffix?: TTranslatedString;
}

type TProps = IExternalProps & CommonHtmlProps & TDataTestId & Omit<InputProps, IExternalProps>;

const InputLayout: React.FunctionComponent<TProps> = ({
  type,
  placeholder,
  name,
  prefix,
  suffix,
  className,
  addonStyle,
  charactersLimit,
  errorMsg,
  size,
  disabled,
  ignoreTouched,
  maxLength,
  onChange,
  value,
  invalid,
  onFocus,
  onBlur,
  ["data-test-id"]: dataTestId,
  ...props
}) => (
  <>
    <InputGroup size={size}>
      {prefix && (
        <InputGroupAddon
          addonType="prepend"
          className={cn(styles.addon, addonStyle, { "is-invalid": invalid })}
        >
          {prefix}
        </InputGroupAddon>
      )}
      <Input
        aria-describedby={generateErrorId(name)}
        aria-invalid={invalid}
        invalid={invalid}
        name={name}
        id={name}
        maxLength={maxLength}
        className={cn(className, styles.inputField)}
        onChange={onChange}
        onBlur={e => {
          if (onBlur) {
            onBlur(e);
          }
        }}
        onFocus={e => {
          if (onFocus) {
            onFocus(e);
          }
        }}
        type={type}
        placeholder={placeholder}
        disabled={disabled}
        value={value}
        data-test-id={dataTestId}
        {...props}
      />
      {suffix && (
        <InputGroupAddon addonType="append" className={cn(styles.addon, { "is-invalid": invalid })}>
          {suffix}
        </InputGroupAddon>
      )}
    </InputGroup>
    <div className={styles.inputMeta}>
      {charactersLimit && <div>{withCountedCharacters(value, charactersLimit)}</div>}
      <FormFieldError
        invalid={invalid}
        name={name}
        defaultMessage={errorMsg}
        ignoreTouched={ignoreTouched}
      />
    </div>
  </>
);

InputLayout.defaultProps = {
  size: EInputSize.NORMAL,
};

export { InputLayout, EInputSize };
