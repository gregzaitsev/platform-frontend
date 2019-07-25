import * as React from "react";
import { FormattedMessage } from "react-intl-phraseapp";
import { compose } from "recompose";
import { Form, withFormik } from "formik";

import { Button, EButtonLayout, EButtonTheme } from "../shared/buttons/Button";
import { appConnect } from "../../store";
import { actions } from "../../modules/actions";
import { FormField } from "../shared/forms/fields/FormField";

interface IDispatchProps {
  sendNomineeConnectRequest: (issuerId: string) => void
}

const NomineeConnectRequestForm = () =>
  <Form>
    <FormField
      // placeholder={formatIntlMessage("settings.verify-email-widget.email-placeholder")}
      name="issuerId"
      data-test-id="..."
    />
    <Button
      layout={EButtonLayout.PRIMARY}
      theme={EButtonTheme.BRAND}
      type="submit"
      data-test-id="..."
    >
      <FormattedMessage id="send request" />
    </Button>
  </Form>;

const NomineeConnectRequestConnectedForm = withFormik<IDispatchProps, {issuerId:string}>({
  // validationSchema: EmailFormSchema,
  handleSubmit: (values, props) => {
    return props.props.sendNomineeConnectRequest(values.issuerId)
  },
})(NomineeConnectRequestForm);

const ConnectToIssuerLayout:React.FunctionComponent<IDispatchProps> = ({ sendNomineeConnectRequest }) => {
  return <>
    <h1>
      <FormattedMessage id="link with a neufund issuer" />
    </h1>
    <p>
      <FormattedMessage id="Enter the Ethereum address of the company you’re wanting to become a nominee for." />
    </p>
    <NomineeConnectRequestConnectedForm sendNomineeConnectRequest={sendNomineeConnectRequest}/>
  </>
};

export const ConnectToIssuer = compose<IDispatchProps,{}>(
  appConnect<{}, IDispatchProps>({
    dispatchToProps: dispatch => ({
      sendNomineeConnectRequest: (issuerId) => {
        dispatch(actions.nomineeFlow.createNomineeRequest(issuerId));
      },
    })
  })
)(ConnectToIssuerLayout);
