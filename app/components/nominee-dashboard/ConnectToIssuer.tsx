import * as React from "react";
import { FormattedMessage } from "react-intl-phraseapp";
import { compose } from "recompose";
import { Form, withFormik } from "formik";

import { Button, EButtonLayout, EButtonTheme } from "../shared/buttons/Button";
import { appConnect } from "../../store";
import { actions } from "../../modules/actions";
import { FormField } from "../shared/forms/fields/FormField";
import { selectUnits } from "../shared/formatters/utils";
import { InputLayout } from "../shared/forms/layouts/InputLayout";
import { TDataTestId, TTranslatedString } from "../../types";

interface IDispatchProps {
  sendNomineeConnectRequest: (issuerId: string) => void
}

interface IMaskedFormProps {
  reportValue: (value?: string) => void;
  reportError: (error:EMaskedFormError) => void;
  name: string;
  placeholder?: string;
  disabled?: boolean
}

interface IMaskedFormState {
  value: string | undefined,
  error: EMaskedFormError | undefined
}

enum EMaskedFormError {
  GENERIC_ERROR = "genericError",
  ILLEGAL_CHARACTER = "illegalCharacter",
}

export class MaskedInput extends React.Component<IMaskedFormProps & TDataTestId, IMaskedFormState> {
  state = {
    value: undefined,
    error: undefined
  };

  onFocus = (value: string | undefined) => undefined;
  onBlur = (value: string | undefined) => undefined;

  onPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    this.onChange(e.clipboardData.getData("text"));
  };

  onChange = (value: string | undefined) => {
    this.setState({ value })
  };

  render(): React.ReactNode {
    return (
      <InputLayout
        value={this.state.value}
        name={this.props.name}
        data-test-id={this.props["data-test-id"]}
        placeholder={this.props.placeholder}
        onBlur={(e: React.FocusEvent<HTMLInputElement>) => this.onBlur(e.target.value)}
        onFocus={(e: React.FocusEvent<HTMLInputElement>) => this.onFocus(e.target.value)}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => this.onChange(e.target.value)}
        onPaste={(e: React.ClipboardEvent<HTMLInputElement>) => this.onPaste(e)}
        errorMsg={this.props.errorMsg}
        disabled={this.props.disabled}
      />
    );
  };
}

const NomineeConnectRequestForm = () =>
  <form>
    <MaskedInput
      // placeholder={formatIntlMessage("settings.verify-email-widget.email-placeholder")}
      reportValue={}
      validate={}
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
  </form>;


const ConnectToIssuerLayout: React.FunctionComponent<IDispatchProps> = ({ sendNomineeConnectRequest }) => {
  return <>
    <h1>
      <FormattedMessage id="link with a neufund issuer" />
    </h1>
    <p>
      <FormattedMessage id="Enter the Ethereum address of the company you’re wanting to become a nominee for." />
    </p>
    <NomineeConnectRequestForm />
  </>
};

export const ConnectToIssuer = compose<IDispatchProps, {}>(
  appConnect<{}, IDispatchProps>({
    dispatchToProps: dispatch => ({
      sendNomineeConnectRequest: (issuerId) => {
        dispatch(actions.nomineeFlow.createNomineeRequest(issuerId));
      },
    })
  })
)(ConnectToIssuerLayout);
