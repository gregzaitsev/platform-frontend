import * as React from "react";
import { FormattedMessage } from "react-intl-phraseapp";

import * as styles from "./Nominee.module.scss";

const FormBase: React.FunctionComponent = ({ children }) =>
  <div className={styles.form}>
    <h4 className={styles.header}>
      <FormattedMessage id="eto.form.eto-nominee.title" />
    </h4>
    {children}
  </div>;

  export {FormBase}
