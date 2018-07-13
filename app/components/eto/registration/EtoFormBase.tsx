import { Form, FormikProps } from "formik";
import * as PropTypes from "prop-types";
import * as React from "react";
import * as Yup from "yup";

import { IProgressOptions, selectFormFractionDone } from "../../../modules/eto-flow/selectors";
import { PercentageIndicatorBar } from "../../shared/PercentageIndicatorBar";
import { Section } from "./Shared";

import * as styles from "./EtoFormBase.module.scss";

interface IProps {
  title: string | React.ReactNode;
}

interface IFormPercentageDoneProps {
  validator: Yup.Schema;
  progressOptions?: IProgressOptions;
}

class PercentageFormDone extends React.Component<IFormPercentageDoneProps> {
  static contextTypes = {
    formik: PropTypes.object,
  };

  render(): React.ReactNode {
    const { values } = this.context.formik as FormikProps<any>;

    const calculatedFraction = selectFormFractionDone(
      this.props.validator,
      values,
      this.props.progressOptions,
    );

    return <PercentageIndicatorBar className={styles.progressBar} fraction={calculatedFraction} />;
  }
}

export const EtoFormBase: React.SFC<IProps & IFormPercentageDoneProps> = ({
  children,
  title,
  validator,
  progressOptions,
}) => (
  <div>
    <Form className={styles.form}>
      <h4 className={styles.header}>{title}</h4>

      <Section>
        <PercentageFormDone validator={validator} progressOptions={progressOptions} />
      </Section>

      {children}
    </Form>
  </div>
);
