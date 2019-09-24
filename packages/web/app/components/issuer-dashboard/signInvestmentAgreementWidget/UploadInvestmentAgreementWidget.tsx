import * as React from "react";
import { FormattedMessage } from "react-intl-phraseapp";
import { branch, renderComponent, renderNothing } from "recompose";
import { compose } from "redux";

import { IEtoDocument } from "../../../lib/api/eto/EtoFileApi.interfaces";
import { actions } from "../../../modules/actions";
import {
  selectIssuerEtoPreviewCode,
  selectIssuerEtoTemplates,
  selectUploadedInvestmentAgreement,
} from "../../../modules/eto-flow/selectors";
import { selectEtoOnChainState } from "../../../modules/eto/selectors";
import { EETOStateOnChain } from "../../../modules/eto/types";
import { appConnect } from "../../../store";
import { appRoutes } from "../../appRoutes";
import { EColumnSpan } from "../../layouts/Container";
import { ButtonArrowRight } from "../../shared/buttons/Button";
import {
  DashboardCenteredWidget,
  DashboardLinkWidget,
} from "../../shared/dashboard-widget/DashboardWidget";
import { createErrorBoundary } from "../../shared/errorBoundary/ErrorBoundary.unsafe";
import { ErrorBoundaryPanel } from "../../shared/errorBoundary/ErrorBoundaryPanel";
import { SignInvestmentAgreement } from "./SignInvestmentAgreement";

interface IDispatchProps {
  downloadAgreementTemplate: (agreementTemplate: IEtoDocument) => void;
}

interface IStateProps {
  stateOnChain: EETOStateOnChain;
  agreementTemplate: IEtoDocument;
  uploadedAgreement: IEtoDocument | undefined;
}

interface IUploadComponentStateProps {
  agreementTemplate: IEtoDocument;
  uploadedAgreement: IEtoDocument | undefined;
}

interface IExternalProps {
  columnSpan?: EColumnSpan;
}

export const UploadInvestmentAgreementLayout: React.FunctionComponent<
  IUploadComponentStateProps & IDispatchProps & IExternalProps
> = ({ downloadAgreementTemplate, agreementTemplate, columnSpan }) => (
  <DashboardCenteredWidget
    title={<FormattedMessage id="download-agreement-widget.signing-title" />}
    text={<FormattedMessage id="download-agreement-widget.signing-text" />}
    columnSpan={columnSpan}
  >
    <ButtonArrowRight
      data-test-id="eto-dashboard-submit-proposal"
      onClick={() => downloadAgreementTemplate(agreementTemplate)}
    >
      <FormattedMessage id="download-agreement-widget.download-and-sign" />
    </ButtonArrowRight>
  </DashboardCenteredWidget>
);

export const EtoCompletedWidgetLayout: React.ComponentType<IExternalProps> = ({ columnSpan }) => (
  <DashboardLinkWidget
    title={<FormattedMessage id="download-agreement-widget.success-title" />}
    text={<FormattedMessage id="download-agreement-widget.success-text" />}
    columnSpan={columnSpan}
    to={appRoutes.wallet}
    buttonText={<FormattedMessage id="download-agreement-widget.go-to-wallet" />}
  />
);

export const UploadInvestmentAgreement = compose<React.FunctionComponent<IExternalProps>>(
  createErrorBoundary(ErrorBoundaryPanel),
  appConnect<IStateProps | null, IDispatchProps>({
    stateToProps: state => {
      const previewCode = selectIssuerEtoPreviewCode(state);
      const etoTemplates = selectIssuerEtoTemplates(state)!;
      if (previewCode) {
        return {
          stateOnChain: selectEtoOnChainState(state, previewCode)!,
          agreementTemplate: etoTemplates.investmentSummaryTemplate,
          uploadedAgreement: selectUploadedInvestmentAgreement(state),
        };
      } else {
        return null;
      }
    },
    dispatchToProps: dispatch => ({
      downloadAgreementTemplate: (agreementTemplate: IEtoDocument) =>
        dispatch(actions.etoDocuments.generateTemplate(agreementTemplate)),
    }),
  }),
  branch<IStateProps | null>(props => props === null, renderNothing),
  branch<IStateProps>(props => props.stateOnChain < EETOStateOnChain.Signing, renderNothing),
  branch<IStateProps>(props => props.stateOnChain === EETOStateOnChain.Refund, renderNothing),
  branch<IStateProps & IExternalProps>(
    props => props.stateOnChain > EETOStateOnChain.Signing,
    renderComponent(EtoCompletedWidgetLayout),
  ),
  branch<IStateProps & IExternalProps>(
    props => props.uploadedAgreement !== undefined,
    renderComponent(SignInvestmentAgreement),
  ),
)(UploadInvestmentAgreementLayout);
