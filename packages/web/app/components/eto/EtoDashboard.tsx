import * as React from "react";
import { FormattedHTMLMessage, FormattedMessage } from "react-intl-phraseapp";
import { lifecycle, withProps } from "recompose";
import { compose } from "redux";

import {
  EEtoMarketingDataVisibleInPreview,
  EEtoState,
} from "../../lib/api/eto/EtoApi.interfaces.unsafe";
import { EOfferingDocumentType } from "../../lib/api/eto/EtoProductsApi.interfaces";
import { EKycRequestStatus } from "../../lib/api/kyc/KycApi.interfaces";
import { actions } from "../../modules/actions";
import { selectBackupCodesVerified, selectVerifiedUserEmail } from "../../modules/auth/selectors";
import {
  selectCanEnableBookBuilding,
  selectCombinedEtoCompanyData,
  selectIsMarketingDataVisibleInPreview,
  selectIsOfferingDocumentSubmitted,
  selectIssuerEtoOfferingDocumentType,
  selectIssuerEtoWithCompanyAndContract,
  selectIsTermSheetSubmitted,
  userHasKycAndEmailVerified,
} from "../../modules/eto-flow/selectors";
import { calculateMarketingEtoData, calculateSettingsEtoData } from "../../modules/eto-flow/utils";
import { TEtoWithCompanyAndContract } from "../../modules/eto/types";
import { selectKycRequestStatus } from "../../modules/kyc/selectors";
import { selectIsLightWallet } from "../../modules/web3/selectors";
import { appConnect } from "../../store";
import { onEnterAction } from "../../utils/OnEnterAction";
import { withContainer } from "../../utils/withContainer.unsafe";
import { Container, EColumnSpan } from "../layouts/Container";
import { Layout } from "../layouts/Layout";
import { WidgetGrid } from "../layouts/WidgetGrid";
import { SettingsWidgets } from "../settings/settings-widget/SettingsWidgets";
import { createErrorBoundary } from "../shared/errorBoundary/ErrorBoundary.unsafe";
import { ErrorBoundaryLayout } from "../shared/errorBoundary/ErrorBoundaryLayout";
import { Heading } from "../shared/Heading";
import { LoadingIndicator } from "../shared/loading-indicator";
import { Tooltip } from "../shared/tooltips/Tooltip";
import { BookBuildingWidget } from "./dashboard/bookBuildingWidget/BookBuildingWidget";
import { ChooseEtoStartDateWidget } from "./dashboard/chooseEtoStartDateWidget/ChooseEtoStartDateWidget";
import { ETOFormsProgressSection } from "./dashboard/ETOFormsProgressSection";
import { PublishETOWidget } from "./dashboard/PublishETOWidget";
import { UploadInvestmentAgreement } from "./dashboard/signInvestmentAgreementWidget/UploadInvestmentAgreementWidget.unsafe";
import { SubmitProposalWidget } from "./dashboard/submitProposalWidget/SubmitProposalWidget";
import { UploadInvestmentMemorandum } from "./dashboard/UploadInvestmentMemorandum";
import { UploadProspectusWidget } from "./dashboard/UploadProspectusWidget";
import { UploadTermSheetWidget } from "./dashboard/UploadTermSheetWidget";
import { DashboardHeading } from "./shared/DashboardHeading";
import { EProjectStatusLayout, EProjectStatusSize, ETOIssuerState } from "./shared/ETOState";
import { EEtoStep, selectEtoStep } from "./utils";

import * as styles from "./EtoDashboard.module.scss";

const SUBMIT_PROPOSAL_THRESHOLD = 1;

interface IEtoStep {
  etoStep: EEtoStep;
}

interface IStateProps {
  verifiedEmail?: string;
  backupCodesVerified: boolean;
  isLightWallet: boolean;
  userHasKycAndEmailVerified: boolean;
  requestStatus?: EKycRequestStatus;
  eto?: TEtoWithCompanyAndContract;
  canEnableBookbuilding: boolean;
  marketingFormsProgress?: number;
  etoSettingsFormsProgress?: number;
  isTermSheetSubmitted?: boolean;
  isOfferingDocumentSubmitted?: boolean;
  offeringDocumentType: EOfferingDocumentType | undefined;
  isMarketingDataVisibleInPreview?: EEtoMarketingDataVisibleInPreview;
}

interface ISubmissionProps {
  shouldViewEtoSettings: boolean;
  shouldViewSubmissionSection: boolean;
  shouldViewMarketingSubmissionSection: boolean;
}

interface IComputedProps extends ISubmissionProps {
  isVerificationSectionDone: boolean;
}

interface IComponentProps extends IComputedProps, IEtoStep {
  verifiedEmail?: string;
  isLightWallet: boolean;
  userHasKycAndEmailVerified: boolean;
  requestStatus?: EKycRequestStatus;
  eto?: TEtoWithCompanyAndContract;
  canEnableBookbuilding: boolean;
  etoFormProgress?: number;
  isTermSheetSubmitted?: boolean;
  isOfferingDocumentSubmitted?: boolean;
  offeringDocumentType: EOfferingDocumentType | undefined;
  isVerificationSectionDone: boolean;
}

interface IDispatchProps {
  initEtoView: () => void;
}

interface IVerifiedUserSectionProps {
  shouldViewSubmissionSection?: boolean;
  canEnableBookbuilding: boolean;
  shouldViewEtoSettings: boolean;
  isTermSheetSubmitted?: boolean;
  shouldViewMarketingSubmissionSection: boolean;
  isOfferingDocumentSubmitted?: boolean;
  offeringDocumentType: EOfferingDocumentType | undefined;
  eto?: TEtoWithCompanyAndContract;
  etoStep: EEtoStep;
}

const selectStepComponent = (etoStep: EEtoStep) => {
  switch (etoStep) {
    case EEtoStep.ONE:
      return (
        <DashboardHeading
          title={<FormattedMessage id="eto-dashboard.verification" />}
          data-test-id="eto-dashboard-verification"
        />
      );
    case EEtoStep.TWO:
      return (
        <DashboardHeading
          title={<FormattedMessage id="eto-dashboard.company-informations" />}
          data-test-id="eto-dashboard-company-informations"
        />
      );
    case EEtoStep.THREE:
      return (
        <DashboardHeading
          title={<FormattedMessage id="eto-dashboard.publish-listing" />}
          data-test-id="eto-dashboard-publish-listing"
        />
      );
    case EEtoStep.FOUR:
      return (
        <>
          <DashboardHeading
            title={<FormattedMessage id="eto-dashboard.listing-review" />}
            data-test-id="eto-dashboard-listing-review"
          />
          <FormattedMessage id="eto-dashboard.listing-review.description" />
        </>
      );
    case EEtoStep.FIVE:
      return (
        <>
          <DashboardHeading
            title={<FormattedMessage id="eto-dashboard.setup-eto" />}
            data-test-id="eto-dashboard-setup-eto"
          />
          <FormattedMessage id="eto-dashboard.setup-eto.description" />
        </>
      );
    case EEtoStep.SIX:
      return (
        <DashboardHeading
          title={<FormattedMessage id="eto-dashboard.publish" />}
          data-test-id="eto-dashboard-publish"
        />
      );
    case EEtoStep.SEVEN:
      return (
        <>
          <DashboardHeading
            title={<FormattedMessage id="eto-dashboard.review" />}
            data-test-id="eto-dashboard-review"
          />
          <FormattedMessage id="eto-dashboard.review.description" />
        </>
      );
    case EEtoStep.EIGHT:
      return (
        <DashboardHeading
          title={<FormattedMessage id="eto-dashboard.live" />}
          data-test-id="eto-dashboard-live"
        />
      );
    case EEtoStep.NINE:
      return <DashboardHeading title={<FormattedMessage id="eto-dashboard.start-fundraising" />} />;
    default:
      return null;
  }
};

const EtoDashboardStepSelector: React.FunctionComponent<IEtoStep> = ({ etoStep }) => (
  <Container columnSpan={EColumnSpan.THREE_COL}>{selectStepComponent(etoStep)}</Container>
);

const SubmitDashBoardSection: React.FunctionComponent<{
  isTermSheetSubmitted?: boolean;
  columnSpan?: EColumnSpan;
}> = ({ isTermSheetSubmitted, columnSpan }) =>
  isTermSheetSubmitted ? (
    <SubmitProposalWidget columnSpan={columnSpan} />
  ) : (
    <UploadTermSheetWidget columnSpan={columnSpan} />
  );

interface IEtoStateRender {
  eto: TEtoWithCompanyAndContract;
  shouldViewSubmissionSection?: boolean;
  isTermSheetSubmitted?: boolean;
  isOfferingDocumentSubmitted?: boolean;
  canEnableBookbuilding: boolean;
  offeringDocumentType: EOfferingDocumentType | undefined;
  shouldViewEtoSettings: boolean;
  shouldViewMarketingSubmissionSection: boolean;
}

const EtoDashboardStateViewComponent: React.FunctionComponent<IEtoStateRender> = ({
  eto,
  shouldViewSubmissionSection,
  isTermSheetSubmitted,
  isOfferingDocumentSubmitted,
  canEnableBookbuilding,
  offeringDocumentType,
  shouldViewEtoSettings,
  shouldViewMarketingSubmissionSection,
}) => {
  const dashboardTitle = (
    <ETOIssuerState eto={eto} size={EProjectStatusSize.LARGE} layout={EProjectStatusLayout.BLACK} />
  );

  switch (eto.state) {
    case EEtoState.PREVIEW:
      return (
        <>
          {/*Show actions header only if actions are available*/}
          {(shouldViewMarketingSubmissionSection || shouldViewSubmissionSection) && (
            <Container columnSpan={EColumnSpan.THREE_COL}>
              <DashboardHeading title={<FormattedMessage id="eto-dashboard.available-actions" />} />
            </Container>
          )}

          {shouldViewMarketingSubmissionSection && (
            <PublishETOWidget columnSpan={EColumnSpan.ONE_AND_HALF_COL} />
          )}

          {shouldViewSubmissionSection && (
            <SubmitDashBoardSection
              isTermSheetSubmitted={isTermSheetSubmitted}
              columnSpan={EColumnSpan.ONE_AND_HALF_COL}
            />
          )}

          <ETOFormsProgressSection shouldViewEtoSettings={shouldViewEtoSettings} />
        </>
      );
    case EEtoState.PENDING:
      return (
        <>
          <ETOFormsProgressSection shouldViewEtoSettings={shouldViewSubmissionSection} />
        </>
      );
    case EEtoState.LISTED:
      return (
        <>
          {canEnableBookbuilding && (
            <BookBuildingWidget columnSpan={EColumnSpan.ONE_AND_HALF_COL} />
          )}
          {!isOfferingDocumentSubmitted &&
            (offeringDocumentType === EOfferingDocumentType.PROSPECTUS ? (
              <UploadProspectusWidget columnSpan={EColumnSpan.ONE_AND_HALF_COL} />
            ) : (
              <UploadInvestmentMemorandum columnSpan={EColumnSpan.ONE_AND_HALF_COL} />
            ))}

          <ETOFormsProgressSection shouldViewEtoSettings={shouldViewSubmissionSection} />
        </>
      );
    case EEtoState.PROSPECTUS_APPROVED:
      return (
        <>
          {canEnableBookbuilding && (
            <BookBuildingWidget columnSpan={EColumnSpan.ONE_AND_HALF_COL} />
          )}
          <ETOFormsProgressSection shouldViewEtoSettings={shouldViewSubmissionSection} />
        </>
      );
    case EEtoState.ON_CHAIN:
      return (
        <>
          <UploadInvestmentAgreement columnSpan={EColumnSpan.ONE_AND_HALF_COL} />
          {canEnableBookbuilding && (
            <BookBuildingWidget columnSpan={EColumnSpan.ONE_AND_HALF_COL} />
          )}
          <ChooseEtoStartDateWidget columnSpan={EColumnSpan.ONE_AND_HALF_COL} />
          <ETOFormsProgressSection shouldViewEtoSettings={shouldViewSubmissionSection} />
        </>
      );
    default:
      return (
        <Container columnSpan={EColumnSpan.THREE_COL}>
          <DashboardHeading title={dashboardTitle} />
        </Container>
      );
  }
};

const VerificationSection: React.FunctionComponent<IEtoStep> = ({ etoStep, ...props }) => (
  <>
    <EtoDashboardStepSelector etoStep={etoStep} />
    <SettingsWidgets isDynamic={true} {...props} columnSpan={EColumnSpan.ONE_AND_HALF_COL} />
  </>
);

const VerifiedUserSection: React.FunctionComponent<IVerifiedUserSectionProps> = ({
  canEnableBookbuilding,
  eto,
  etoStep,
  isOfferingDocumentSubmitted,
  isTermSheetSubmitted,
  offeringDocumentType,
  shouldViewEtoSettings,
  shouldViewMarketingSubmissionSection,
  shouldViewSubmissionSection,
}) => {
  if (eto) {
    return (
      <>
        <Container columnSpan={EColumnSpan.THREE_COL} className="mb-5">
          <div className={styles.header}>
            <Heading level={2} decorator={false} disableTransform={true} inheritFont={true}>
              <FormattedHTMLMessage tagName="span" id="eto-dashboard.header" />
            </Heading>
            {eto && (
              <ETOIssuerState
                eto={eto}
                size={EProjectStatusSize.HUGE}
                layout={EProjectStatusLayout.INHERIT}
                className="ml-3"
              />
            )}
          </div>
          <Tooltip
            content={<FormattedHTMLMessage id="eto-dashboard.tooltip.description" tagName="span" />}
          >
            <FormattedMessage id="eto-dashboard.tooltip" />
          </Tooltip>
        </Container>
        <EtoDashboardStepSelector etoStep={etoStep} />
        <EtoDashboardStateViewComponent
          isTermSheetSubmitted={isTermSheetSubmitted}
          isOfferingDocumentSubmitted={isOfferingDocumentSubmitted}
          shouldViewEtoSettings={shouldViewEtoSettings}
          shouldViewSubmissionSection={shouldViewSubmissionSection}
          eto={eto}
          canEnableBookbuilding={canEnableBookbuilding}
          offeringDocumentType={offeringDocumentType}
          shouldViewMarketingSubmissionSection={shouldViewMarketingSubmissionSection}
        />
      </>
    );
  } else {
    return (
      <Container columnSpan={EColumnSpan.THREE_COL}>
        <LoadingIndicator />
      </Container>
    );
  }
};

const EtoDashboardLayout: React.FunctionComponent<IComponentProps> = props => {
  const { isVerificationSectionDone, userHasKycAndEmailVerified, ...rest } = props;

  return (
    <WidgetGrid data-test-id="eto-dashboard-application">
      {!isVerificationSectionDone && <VerificationSection {...rest} />}
      {userHasKycAndEmailVerified && <VerifiedUserSection {...rest} />}
    </WidgetGrid>
  );
};

const EtoDashboard = compose<React.FunctionComponent>(
  createErrorBoundary(ErrorBoundaryLayout),
  appConnect<IStateProps, IDispatchProps>({
    stateToProps: s => ({
      verifiedEmail: selectVerifiedUserEmail(s.auth),
      backupCodesVerified: selectBackupCodesVerified(s),
      isLightWallet: selectIsLightWallet(s.web3),
      userHasKycAndEmailVerified: userHasKycAndEmailVerified(s),
      requestStatus: selectKycRequestStatus(s),
      eto: selectIssuerEtoWithCompanyAndContract(s),
      canEnableBookbuilding: selectCanEnableBookBuilding(s),
      isTermSheetSubmitted: selectIsTermSheetSubmitted(s),
      isOfferingDocumentSubmitted: selectIsOfferingDocumentSubmitted(s),
      marketingFormsProgress: calculateMarketingEtoData(selectCombinedEtoCompanyData(s)),
      etoSettingsFormsProgress: calculateSettingsEtoData(selectCombinedEtoCompanyData(s)),
      offeringDocumentType: selectIssuerEtoOfferingDocumentType(s),
      isMarketingDataVisibleInPreview: selectIsMarketingDataVisibleInPreview(s),
    }),
    dispatchToProps: dispatch => ({
      initEtoView: () => {
        dispatch(actions.etoFlow.loadIssuerEto());
        dispatch(actions.kyc.kycLoadIndividualDocumentList());
      },
    }),
  }),
  withProps<IComputedProps, IStateProps>(props => {
    const shouldViewEtoSettings = Boolean(
      props.marketingFormsProgress && props.marketingFormsProgress >= SUBMIT_PROPOSAL_THRESHOLD,
    );
    const shouldViewSubmissionSection = Boolean(
      props.etoSettingsFormsProgress && props.etoSettingsFormsProgress >= SUBMIT_PROPOSAL_THRESHOLD,
    );

    const isVerificationSectionDone = props.userHasKycAndEmailVerified && props.backupCodesVerified;

    const shouldViewMarketingSubmissionSection =
      shouldViewEtoSettings &&
      !(shouldViewSubmissionSection && props.isTermSheetSubmitted) &&
      props.isMarketingDataVisibleInPreview === EEtoMarketingDataVisibleInPreview.NOT_VISIBLE;

    return {
      isVerificationSectionDone,
      shouldViewEtoSettings,
      shouldViewSubmissionSection,
      shouldViewMarketingSubmissionSection,
      etoStep: props.eto
        ? selectEtoStep(
            isVerificationSectionDone,
            props.eto.state,
            shouldViewEtoSettings,
            props.isMarketingDataVisibleInPreview,
            shouldViewSubmissionSection,
            props.isTermSheetSubmitted,
          )
        : EEtoStep.ONE,
    };
  }),
  onEnterAction<IStateProps & IDispatchProps>({
    actionCreator: (_, props) => {
      if (props.userHasKycAndEmailVerified) {
        props.initEtoView();
      }
    },
  }),
  lifecycle<IStateProps & IDispatchProps, {}>({
    componentDidUpdate(nextProps: IStateProps & IDispatchProps): void {
      if (this.props.userHasKycAndEmailVerified !== nextProps.userHasKycAndEmailVerified) {
        this.props.initEtoView();
      }
    },
  }),
  withContainer(Layout),
)(EtoDashboardLayout);

export { EtoDashboard, EtoDashboardLayout, EtoDashboardStateViewComponent };
