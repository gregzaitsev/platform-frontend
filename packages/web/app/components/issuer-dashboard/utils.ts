import {
  EEtoMarketingDataVisibleInPreview,
  EEtoState,
} from "../../lib/api/eto/EtoApi.interfaces.unsafe";

export enum EEtoStep {
  VERIFICATION = "verification",
  FILL_INFORMATION_ABOUT_COMPANY = "fill_information_about_company",
  PUBLISH_LISTING_PAGE = "publish_listing_page",
  LISTING_PAGE_IN_REVIEW = "listing_page_in_review",
  UPLOAD_SIGNED_TERMSHEET = "upload_signed_termsheet",
  PUBLISH_INVESTMENT_OFFER = "publish_investment_offer",
  INVESTMENT_OFFER_IN_REVIEW = "investment_offer_in_review",
  UPLOAD_OFFERING_DOCUMENT = "upload_offering_document",
  UPLOAD_ISHA = "upload_isha",
  WAIT_FOR_SMART_CONTRACT = "wait_for_smart_contract",
  WAIT_FOR_NOMINEE_DOCUMENTS = "wait_for_nominee_documents",
  SETUP_START_DATE = "setup_start_date",
  LINK_NOMINEE = "link_nominee",
}

// TODO: This can be moved fully to redux selector
/**
 * Calculate current eto state
 * see ISSUER FLOW diagram in miro business logic details
 * @note Even when eto is in specific state in some cases it's still possible to access previous steps actions
 * (for e.g. publish marketing listing action is available until offer is fully published
 */
export const selectEtoStep = (
  isVerificationSectionDone: boolean,
  etoState: EEtoState,
  shouldViewEtoSettings: boolean,
  isMarketingDataVisibleInPreview: EEtoMarketingDataVisibleInPreview | undefined,
  isTermSheetSubmitted: boolean | undefined,
  isVotingRightsFilledWithAllRequired: boolean,
  isInvestmentAndEtoTermsFilledWithAllRequired: boolean,
  isOfferingDocumentSubmitted: boolean | undefined,
  isISHASubmitted: boolean | undefined,
): EEtoStep => {
  if (!isVerificationSectionDone) {
    return EEtoStep.VERIFICATION;
  }

  if (etoState === EEtoState.PREVIEW) {
    const areEtoFormsFilledWithAllRequired =
      isInvestmentAndEtoTermsFilledWithAllRequired && isVotingRightsFilledWithAllRequired;

    if (isMarketingDataVisibleInPreview === EEtoMarketingDataVisibleInPreview.VISIBILITY_PENDING) {
      return EEtoStep.LISTING_PAGE_IN_REVIEW;
    }

    if (areEtoFormsFilledWithAllRequired && isTermSheetSubmitted) {
      return EEtoStep.PUBLISH_INVESTMENT_OFFER;
    }

    /**
     * When all eto forms are filled (which also means nominee is linked)
     * And term sheet was not yet submitted
     */
    if (areEtoFormsFilledWithAllRequired && !isTermSheetSubmitted) {
      return EEtoStep.UPLOAD_SIGNED_TERMSHEET;
    }

    /**
     * When both investment and eto terms forms are filled correctly
     * And when nominee is not linked yet
     * (`shouldViewSubmissionSection` return true when all eto forms,
     * including Token Holder Voting Right, are filled correctly)
     */
    if (isInvestmentAndEtoTermsFilledWithAllRequired && !areEtoFormsFilledWithAllRequired) {
      return EEtoStep.LINK_NOMINEE;
    }

    if (
      shouldViewEtoSettings &&
      isMarketingDataVisibleInPreview === EEtoMarketingDataVisibleInPreview.NOT_VISIBLE
    ) {
      return EEtoStep.PUBLISH_LISTING_PAGE;
    }

    return EEtoStep.FILL_INFORMATION_ABOUT_COMPANY;
  }

  if (etoState === EEtoState.PENDING) {
    return EEtoStep.INVESTMENT_OFFER_IN_REVIEW;
  }

  if (etoState === EEtoState.LISTED || etoState === EEtoState.PROSPECTUS_APPROVED) {
    if (isISHASubmitted) {
      return EEtoStep.WAIT_FOR_SMART_CONTRACT;
    }

    if (isOfferingDocumentSubmitted) {
      return EEtoStep.UPLOAD_ISHA;
    }

    return EEtoStep.UPLOAD_OFFERING_DOCUMENT;
  }

  if (etoState === EEtoState.ON_CHAIN) {
    if (true) {
      return EEtoStep.WAIT_FOR_NOMINEE_DOCUMENTS;
    }

    return EEtoStep.SETUP_START_DATE;
  }

  throw new Error("Eto step is not defined");
};
