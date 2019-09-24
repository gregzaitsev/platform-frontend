import * as React from "react";
import { FormattedMessage } from "react-intl-phraseapp";
import { branch, renderComponent, renderNothing } from "recompose";
import { compose } from "redux";

import { IEtoDocument } from "../../../lib/api/eto/EtoFileApi.interfaces";
import { actions } from "../../../modules/actions";
import {
  selectInvestmentAgreementLoading,
  selectIssuerEtoId,
  selectSignedInvestmentAgreementUrl,
  selectUploadedInvestmentAgreement,
} from "../../../modules/eto-flow/selectors";
import { appConnect } from "../../../store";
import { onEnterAction } from "../../../utils/OnEnterAction";
import { investmentAgreementNotSigned } from "../../documents/utils";
import { EColumnSpan } from "../../layouts/Container";
import { ButtonArrowRight } from "../../shared/buttons/Button";
import {
  DashboardCenteredWidget,
  DashboardWidget,
} from "../../shared/dashboard-widget/DashboardWidget";
import { LoadingIndicator } from "../../shared/loading-indicator/LoadingIndicator";

interface IDispatchProps {
  signInvestmentAgreement: (etoId: string, agreementHash: string) => void;
}

interface IStateProps {
  etoId: string;
  uploadedAgreement: IEtoDocument;
  signedInvestmentAgreementUrlLoading: boolean;
  signedInvestmentAgreementUrl: string | null;
}

interface IExternalProps {
  columnSpan?: EColumnSpan;
}

export const WaitingForNominee: React.FunctionComponent<IExternalProps> = ({ columnSpan }) => (
  <DashboardWidget
    data-test-id="dashboard-wait-for-nominee-to-sign-isha-widget"
    title={<FormattedMessage id="download-agreement-widget.wait-for-nominee-to-sign" />}
    text={<FormattedMessage id="download-agreement-widget.wait-for-nominee-to-sign-text" />}
    columnSpan={columnSpan}
  />
);

interface IWaitingToBeSigned {
  etoId: string;
  ipfsHash: string;
  signedInvestmentAgreementUrl: null | string;
  signInvestmentAgreement: (etoId: string, ipfsHash: string) => void;
}

export const WaitingToBeSigned: React.FunctionComponent<IWaitingToBeSigned & IExternalProps> = ({
  etoId,
  ipfsHash,
  signedInvestmentAgreementUrl,
  signInvestmentAgreement,
  columnSpan,
}) => (
  <DashboardCenteredWidget
    data-test-id="dashboard-sign-isha-on-chain-widget"
    title={<FormattedMessage id="download-agreement-widget.sign-on-ethereum" />}
    text={
      signedInvestmentAgreementUrl === null ? (
        <FormattedMessage id="download-agreement-widget.sign-on-ethereum-text" />
      ) : (
        <FormattedMessage id="download-agreement-widget.sign-again-text" />
      )
    }
    columnSpan={columnSpan}
  >
    <ButtonArrowRight
      data-test-id="dashboard-sign-isha-on-chain-widget.sign"
      onClick={() => signInvestmentAgreement(etoId, ipfsHash)}
    >
      <FormattedMessage id="download-agreement-widget.sign-on-ethereum" />
    </ButtonArrowRight>
  </DashboardCenteredWidget>
);

export const SignInvestmentAgreementLayout: React.FunctionComponent<
  IStateProps & IDispatchProps & IExternalProps
> = ({
  etoId,
  signedInvestmentAgreementUrl,
  uploadedAgreement,
  signInvestmentAgreement,
  columnSpan,
}) =>
  investmentAgreementNotSigned(signedInvestmentAgreementUrl, uploadedAgreement.ipfsHash) ? (
    <WaitingToBeSigned
      etoId={etoId}
      ipfsHash={uploadedAgreement.ipfsHash}
      signedInvestmentAgreementUrl={signedInvestmentAgreementUrl}
      signInvestmentAgreement={signInvestmentAgreement}
      columnSpan={columnSpan}
    />
  ) : (
    <WaitingForNominee columnSpan={columnSpan} />
  );

export const SignInvestmentAgreement = compose<React.FunctionComponent<IExternalProps>>(
  appConnect<IStateProps | null, IDispatchProps>({
    stateToProps: state => {
      const uploadedAgreement = selectUploadedInvestmentAgreement(state);

      const etoId = selectIssuerEtoId(state);
      // there is another widget showing up if there's no agreement uploaded,
      // so uploadedAgreement=== null is not a valid case
      if (etoId && uploadedAgreement) {
        return {
          etoId,
          uploadedAgreement,
          signedInvestmentAgreementUrlLoading: selectInvestmentAgreementLoading(state),
          signedInvestmentAgreementUrl: selectSignedInvestmentAgreementUrl(state),
        };
      } else {
        return null;
      }
    },
    dispatchToProps: dispatch => ({
      signInvestmentAgreement: (etoId: string, agreementHash: string) =>
        dispatch(actions.etoFlow.signInvestmentAgreement(etoId, agreementHash)),
    }),
  }),
  branch<IStateProps | null>(props => props === null, renderNothing),
  onEnterAction<IStateProps>({
    actionCreator: (dispatch, props) =>
      dispatch(actions.etoFlow.loadSignedInvestmentAgreement(props.etoId)),
  }),
  branch<IStateProps>(
    props => props.signedInvestmentAgreementUrlLoading,
    renderComponent(LoadingIndicator),
  ),
)(SignInvestmentAgreementLayout);
