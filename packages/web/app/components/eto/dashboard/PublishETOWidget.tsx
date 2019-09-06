import * as cn from "classnames";
import * as React from "react";
import { FormattedMessage } from "react-intl-phraseapp";
import { Col } from "reactstrap";
import { compose } from "recompose";

import { actions } from "../../../modules/actions";
import { appConnect } from "../../../store";
import { EColumnSpan } from "../../layouts/Container";
import { ButtonArrowRight } from "../../shared/buttons/Button";
import { createErrorBoundary } from "../../shared/errorBoundary/ErrorBoundary.unsafe";
import { ErrorBoundaryPanel } from "../../shared/errorBoundary/ErrorBoundaryPanel";
import { Panel } from "../../shared/Panel";

import * as styles from "../EtoContentWidget.module.scss";

interface IDispatchProps {
  publish: () => void;
}

interface IExternalProps {
  columnSpan?: EColumnSpan;
}

export const PublishETOWidgetComponent: React.FunctionComponent<
  IDispatchProps & IExternalProps
> = ({ publish, columnSpan }) => (
  <Panel headerText={<FormattedMessage id="settings.publish-eto.header" />} columnSpan={columnSpan}>
    <section className={styles.content}>
      <p className={cn(styles.text, "pt-2")}>
        <FormattedMessage id="settings.publish-eto.description" />
      </p>
      <Col className="d-flex justify-content-center">
        <ButtonArrowRight data-test-id="eto-dashboard-publish-eto" onClick={publish}>
          <FormattedMessage id="settings.publish-eto.publish" />
        </ButtonArrowRight>
      </Col>
    </section>
  </Panel>
);

export const PublishETOWidget = compose<IDispatchProps & IExternalProps, IExternalProps>(
  createErrorBoundary(ErrorBoundaryPanel),
  appConnect<IDispatchProps>({
    dispatchToProps: dispatch => ({
      publish: () => dispatch(actions.etoFlow.publishDataStart()),
    }),
  }),
)(PublishETOWidgetComponent);
