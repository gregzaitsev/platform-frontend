import { keyBy } from "lodash";
import * as React from "react";
import { FormattedMessage } from "react-intl-phraseapp";
import { compose, withProps } from "recompose";

import { EEtoDocumentType, IEtoDocument } from "../../../../lib/api/eto/EtoFileApi.interfaces";
import { EOfferingDocumentType } from "../../../../lib/api/eto/EtoProductsApi.interfaces";
import { actions } from "../../../../modules/actions";
import { TEtoWithCompanyAndContract } from "../../../../modules/eto/types";
import { appConnect } from "../../../../store";
import { etoPublicViewLink } from "../../../appRouteUtils";
import { EtherscanAddressLink } from "../../../shared/links/index";
import { TagWithFallback } from "../../../shared/Tag.unsafe";

import * as styles from "./EtoOverviewStatus.module.scss";

interface IExternalProps {
  eto: TEtoWithCompanyAndContract;
  innerClass?: string;
}

interface IWithProps {
  termSheet: IEtoDocument;
  prospectusApproved: IEtoDocument;
  smartContractOnChain: boolean;
}

interface IDispatchProps {
  downloadDocument: (document: IEtoDocument) => void;
}

const hasDocument = (document: IEtoDocument): boolean =>
  Boolean(document && document.name && document.name.length);

const TagsWidgetLayout: React.FunctionComponent<IWithProps & IExternalProps & IDispatchProps> = ({
  eto,
  termSheet,
  prospectusApproved,
  smartContractOnChain,
  downloadDocument,
  innerClass,
}) => {
  const approvedDocumentTitle =
    eto.product.offeringDocumentType === EOfferingDocumentType.PROSPECTUS ? (
      <FormattedMessage id="shared-component.eto-overview.prospectus-approved" />
    ) : (
      <FormattedMessage id="shared-component.eto-overview.investment-memorandum" />
    );

  return (
    <div className={styles.tagsWrapper}>
      <TagWithFallback
        condition={eto.company.companyPitchdeckUrl}
        to={eto.company.companyPitchdeckUrl ? eto.company.companyPitchdeckUrl.url : ""}
        textElement={<FormattedMessage id="shared-component.eto-overview.pitch-deck" />}
        innerClass={innerClass}
        data-test-id="eto-overview-pitch-deck-button"
      />
      <TagWithFallback
        condition={hasDocument(termSheet)}
        onClick={(e: React.MouseEvent) => {
          downloadDocument(termSheet);
          e.stopPropagation();
        }}
        to={etoPublicViewLink(eto.previewCode, eto.product.jurisdiction)}
        textElement={<FormattedMessage id="shared-component.eto-overview.term-sheet" />}
        innerClass={innerClass}
        data-test-id="eto-overview-term-sheet-button"
      />

      <TagWithFallback
        condition={hasDocument(prospectusApproved)}
        onClick={(e: React.MouseEvent) => {
          downloadDocument(prospectusApproved);
          e.stopPropagation();
        }}
        to={etoPublicViewLink(eto.previewCode, eto.product.jurisdiction)}
        textElement={approvedDocumentTitle}
        innerClass={innerClass}
        data-test-id="eto-overview-prospectus-approved-button"
      />
      <TagWithFallback
        onClick={(e: React.MouseEvent) => e.stopPropagation()}
        condition={smartContractOnChain}
        component={<EtherscanAddressLink address={eto.etoId} />}
        to={etoPublicViewLink(eto.previewCode, eto.product.jurisdiction)}
        textElement={
          <FormattedMessage id="shared-component.eto-overview.smart-contract-on-chain" />
        }
        data-test-id="eto-overview-smart-contract-on-chain-button"
        innerClass={innerClass}
      />
    </div>
  );
};

const TagsWidget = compose<IDispatchProps & IWithProps & IExternalProps, IExternalProps>(
  appConnect<{}, IDispatchProps, IExternalProps>({
    dispatchToProps: dispatch => ({
      downloadDocument: (document: IEtoDocument) =>
        dispatch(actions.eto.downloadEtoDocument(document)),
    }),
  }),
  withProps<IWithProps, IExternalProps & IDispatchProps>(props => {
    const documentsByType = keyBy(props.eto.documents, document => document.documentType);
    return {
      smartContractOnChain: Boolean(props.eto.contract),
      termSheet: documentsByType[EEtoDocumentType.SIGNED_TERMSHEET],
      prospectusApproved: documentsByType[EEtoDocumentType.APPROVED_INVESTOR_OFFERING_DOCUMENT],
    };
  }),
)(TagsWidgetLayout);

export { TagsWidget, TagsWidgetLayout };
