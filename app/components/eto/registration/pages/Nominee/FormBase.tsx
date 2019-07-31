import * as React from "react";
import { Form } from "../../../../shared/forms/Form";
import { FormattedMessage } from "react-intl-phraseapp";

import * as styles from "./Nominee.module.scss";

const FormBase: React.FunctionComponent = ({ children }) =>
  <Form className={styles.form}>
    <h4 className={styles.header}>
      <FormattedMessage id="eto.form.eto-nominee.title" />
    </h4>
    {children}
  </Form>;

  export {FormBase}
