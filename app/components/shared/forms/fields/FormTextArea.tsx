import * as cn from "classnames";
import { connect as formikConnect, Field, FieldProps } from "formik";
import * as React from "react";
import { Input } from "reactstrap";
import { branch, compose, renderComponent } from "recompose";

import { CommonHtmlProps, TFormikConnect } from "../../../../types";
import { FormFieldError, generateErrorId } from "./FormFieldError";
import {
  applyCharactersLimit,
  IFormField,
  isNonValid,
  isWysiwyg,
  withCountedCharacters,
  withFormField,
} from "./utils.unsafe";

import * as styles from "./FormStyles.module.scss";

interface IFieldGroup {
  name: string;
  disabled?: boolean;
  placeholder?: string;
  charactersLimit?: number;
}

type TFieldGroupProps = IFieldGroup & CommonHtmlProps;

const RichTextAreaLayout = React.lazy(() =>
  import("../layouts/RichTextAreaLayout").then(imp => ({ default: imp.RichTextAreaLayout })),
);

const RichTextArea: React.FunctionComponent<TFieldGroupProps & TFormikConnect> = ({
  disabled,
  placeholder,
  name,
  className,
  charactersLimit,
  formik,
}) => {
  const { touched, errors, submitCount, setFieldTouched, setFieldValue } = formik;

  const invalid = isNonValid(touched, errors, name, submitCount);

  return (
    <Field
      name={name}
      render={({ field }: FieldProps) => (
        <>
          <RichTextAreaLayout
            invalid={invalid}
            name={name}
            placeholder={placeholder}
            className={className}
            disabled={disabled}
            value={field.value}
            onChange={value => {
              setFieldTouched(name);
              setFieldValue(name, applyCharactersLimit(value, charactersLimit));
            }}
          />
          <FormFieldError name={name} />
        </>
      )}
    />
  );
};

const TextArea: React.FunctionComponent<TFieldGroupProps & TFormikConnect> = ({
  disabled,
  placeholder,
  name,
  className,
  charactersLimit,
  formik,
}) => {
  const { touched, errors, submitCount, setFieldTouched, setFieldValue } = formik;

  const invalid = isNonValid(touched, errors, name, submitCount);

  return (
    <Field
      name={name}
      render={({ field }: FieldProps) => (
        <section>
          <Input
            {...field}
            type="textarea"
            aria-describedby={generateErrorId(name)}
            aria-invalid={invalid}
            invalid={invalid}
            disabled={disabled}
            value={field.value}
            placeholder={placeholder}
            className={cn(className, styles.inputField)}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              setFieldTouched(name);
              setFieldValue(name, applyCharactersLimit(e.target.value, charactersLimit));
            }}
          />
          <div className={styles.inputMeta}>
            {charactersLimit && withCountedCharacters(field.value, charactersLimit)}
            <FormFieldError name={name} />
          </div>
        </section>
      )}
    />
  );
};

export const FormTextArea = compose<
  TFieldGroupProps & TFormikConnect,
  TFieldGroupProps & IFormField
>(
  withFormField,
  formikConnect,
  branch<IFieldGroup & TFormikConnect>(
    props => isWysiwyg(props.formik.validationSchema, props.name),
    renderComponent(RichTextArea),
  ),
)(TextArea);
