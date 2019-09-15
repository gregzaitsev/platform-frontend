import * as cn from "classnames";
import * as React from "react";
import { FormattedMessage } from "react-intl-phraseapp";
import { Col } from "reactstrap";
import { compose } from "redux";

import { actions } from "../../../modules/actions";
import { appConnect } from "../../../store";
import { EColumnSpan } from "../../layouts/Container";
import { ButtonArrowRight } from "../../shared/buttons/index";
import { createErrorBoundary } from "../../shared/errorBoundary/ErrorBoundary.unsafe";
import { ErrorBoundaryPanel } from "../../shared/errorBoundary/ErrorBoundaryPanel";
import { Panel } from "../../shared/Panel";

import * as styles from "../../eto/EtoContentWidget.module.scss";

interface IDispatchProps {
  submitProposal: () => void;
}

interface IExternalProps {
  columnSpan?: EColumnSpan;
}

export const SubmitProposalWidgetComponent: React.FunctionComponent<
  IDispatchProps & IExternalProps
> = ({ submitProposal, columnSpan }) => (
  <Panel
    headerText={<FormattedMessage id="settings.submit-your-proposal.header" />}
    columnSpan={columnSpan}
  >
    <div className={styles.content}>
      <p className={cn(styles.text, "pt-2")}>
        <FormattedMessage id="settings.submit-your-proposal.description" />
      </p>
      <Col className="d-flex justify-content-center">
        <ButtonArrowRight data-test-id="eto-dashboard-submit-proposal" onClick={submitProposal}>
          <FormattedMessage id="settings.submit-your-proposal.publish" />
        </ButtonArrowRight>
      </Col>
    </div>
  </Panel>
);

export const SubmitProposalWidget = compose<React.FunctionComponent<IExternalProps>>(
  createErrorBoundary(ErrorBoundaryPanel),
  appConnect<IDispatchProps>({
    dispatchToProps: dispatch => ({
      submitProposal: () => dispatch(actions.etoFlow.submitDataStart()),
    }),
  }),
)(SubmitProposalWidgetComponent);
