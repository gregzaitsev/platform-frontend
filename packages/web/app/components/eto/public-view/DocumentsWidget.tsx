import * as React from "react";
import { FormattedMessage } from "react-intl-phraseapp";
import { Col, Row } from "reactstrap";
import { compose } from "recompose";

import { TCompanyEtoData } from "../../../lib/api/eto/EtoApi.interfaces.unsafe";
import { IEtoDocument, TEtoDocumentTemplates } from "../../../lib/api/eto/EtoFileApi.interfaces";
import { ignoredDocuments, ignoredTemplatesPublicView } from "../../../lib/api/eto/EtoFileUtils";
import { EOfferingDocumentType } from "../../../lib/api/eto/EtoProductsApi.interfaces";
import { actions } from "../../../modules/actions";
import { appConnect } from "../../../store";
import { CommonHtmlProps } from "../../../types";
import { getInvestorDocumentTitles } from "../../documents/utils";
import { Container, EColumnSpan } from "../../layouts/Container";
import { DocumentTemplateButton } from "../../shared/DocumentLink";
import { Panel } from "../../shared/Panel";
import { DashboardHeading } from "../shared/DashboardHeading";

import * as styles from "./DocumentsWidget.module.scss";

type TExternalProps = {
  companyMarketingLinks: TCompanyEtoData["marketingLinks"];
  etoTemplates: TEtoDocumentTemplates;
  etoDocuments: TEtoDocumentTemplates;
  offeringDocumentType: EOfferingDocumentType;
  columnSpan?: EColumnSpan;
};

type TDispatchProps = {
  downloadDocument: (document: IEtoDocument) => void;
};

const DocumentsWidgetLayout: React.FunctionComponent<
  TDispatchProps & TExternalProps & CommonHtmlProps
> = ({
  downloadDocument,
  etoDocuments,
  etoTemplates,
  className,
  offeringDocumentType,
  columnSpan,
}) => {
  const documentTitles = getInvestorDocumentTitles(offeringDocumentType);

  return etoTemplates || etoDocuments ? (
    <Container columnSpan={EColumnSpan.ONE_COL}>
      <DashboardHeading
        title={<FormattedMessage id="eto.public-view.documents.legal-documents" />}
      />
      <Panel className={className} columnSpan={columnSpan}>
        <section className={styles.group}>
          <Row>
            {Object.keys(etoTemplates)
              .filter(key => !ignoredTemplatesPublicView.some(template => template === key))
              .map((key, i) => (
                <Col sm="6" md="12" lg="6" key={i} className={styles.document}>
                  <DocumentTemplateButton
                    onClick={() => downloadDocument(etoTemplates[key])}
                    title={documentTitles[etoTemplates[key].documentType]}
                  />
                </Col>
              ))}
            {Object.keys(etoDocuments)
              .filter(
                key =>
                  !ignoredDocuments.some(document => document === etoDocuments[key].documentType),
              )
              .map((key, i) => (
                <Col sm="6" md="12" lg="6" key={i} className={styles.document}>
                  <DocumentTemplateButton
                    onClick={() => downloadDocument(etoDocuments[key])}
                    title={documentTitles[etoDocuments[key].documentType]}
                  />
                </Col>
              ))}
          </Row>
        </section>
      </Panel>
    </Container>
  ) : null;
};

const DocumentsWidget = compose<
  TExternalProps & TDispatchProps & CommonHtmlProps,
  TExternalProps & CommonHtmlProps
>(
  appConnect<{}, TDispatchProps, TExternalProps>({
    dispatchToProps: dispatch => ({
      downloadDocument: (document: IEtoDocument) =>
        dispatch(actions.eto.downloadEtoDocument(document)),
    }),
  }),
)(DocumentsWidgetLayout);

export { DocumentsWidget, DocumentsWidgetLayout };
