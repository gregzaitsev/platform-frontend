import * as React from "react";
import { Form } from "../../../../shared/forms/Form";
import { FormattedMessage } from "react-intl-phraseapp";

import * as formStyles from "../../EtoFormBase.module.scss";

const FormBase: React.FunctionComponent = ({ children }) =>
  <Form className={formStyles.form}>
    <h4 className={formStyles.header}>
      <FormattedMessage id="eto.form.eto-nominee.title" />
    </h4>
    {children}
  </Form>;

  export {FormBase}
