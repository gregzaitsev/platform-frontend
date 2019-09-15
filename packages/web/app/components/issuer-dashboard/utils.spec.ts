import { expect } from "chai";

import {
  EEtoMarketingDataVisibleInPreview,
  EEtoState,
} from "../../lib/api/eto/EtoApi.interfaces.unsafe";
import { EEtoStep, selectEtoStep } from "./utils";

describe("selectEtoStep", () => {
  it("should return verification step if verification is not done", () => {
    expect(
      selectEtoStep(
        false,
        EEtoState.PREVIEW,
        false,
        EEtoMarketingDataVisibleInPreview.NOT_VISIBLE,
        false,
        false,
        false,
        false,
        false,
      ),
    ).to.eq(EEtoStep.VERIFICATION);

    // Even for impossible states
    expect(
      selectEtoStep(
        false,
        EEtoState.LISTED,
        true,
        EEtoMarketingDataVisibleInPreview.VISIBLE,
        true,
        true,
        true,
        false,
        false,
      ),
    ).to.eq(EEtoStep.VERIFICATION);
  });

  it("should return FILL_INFORMATION_ABOUT_COMPANY step if verification is done and state is PREVIEW", () => {
    expect(
      selectEtoStep(
        true,
        EEtoState.PREVIEW,
        false,
        EEtoMarketingDataVisibleInPreview.NOT_VISIBLE,
        false,
        false,
        false,
        false,
        false,
      ),
    ).to.eq(EEtoStep.FILL_INFORMATION_ABOUT_COMPANY);
  });

  it("should return PUBLISH_LISTING_PAGE if verification is done, state is PREVIEW and marketing data is filled", () => {
    expect(
      selectEtoStep(
        true,
        EEtoState.PREVIEW,
        true,
        EEtoMarketingDataVisibleInPreview.NOT_VISIBLE,
        false,
        false,
        false,
        false,
        false,
      ),
    ).to.eq(EEtoStep.PUBLISH_LISTING_PAGE);
  });

  it("should return LISTING_PAGE_IN_REVIEW step if verification is done, state is PREVIEW, marketing data is filled and marketing data is in PENDING state", () => {
    expect(
      selectEtoStep(
        true,
        EEtoState.PREVIEW,
        true,
        EEtoMarketingDataVisibleInPreview.VISIBILITY_PENDING,
        false,
        false,
        false,
        false,
        false,
      ),
    ).to.eq(EEtoStep.LISTING_PAGE_IN_REVIEW);

    // If ETO data is filled too, we should still display step 4
    expect(
      selectEtoStep(
        true,
        EEtoState.PREVIEW,
        true,
        EEtoMarketingDataVisibleInPreview.VISIBILITY_PENDING,
        false,
        true,
        true,
        false,
        false,
      ),
    ).to.eq(EEtoStep.LISTING_PAGE_IN_REVIEW);
  });

  it("should return LINK_NOMINEE if verification is done, state is PREVIEW and only investment and eto terms are filled", () => {
    expect(
      selectEtoStep(
        true,
        EEtoState.PREVIEW,
        true,
        EEtoMarketingDataVisibleInPreview.NOT_VISIBLE,
        false,
        false,
        true,
        false,
        false,
      ),
    ).to.eq(EEtoStep.LINK_NOMINEE);
  });

  it("should return UPLOAD_SIGNED_TERMSHEET step if verification is done, state is PREVIEW, eto data is filled (including nominee)", () => {
    expect(
      selectEtoStep(
        true,
        EEtoState.PREVIEW,
        true,
        EEtoMarketingDataVisibleInPreview.VISIBLE,
        false,
        true,
        true,
        false,
        false,
      ),
    ).to.eq(EEtoStep.UPLOAD_SIGNED_TERMSHEET);

    // If ETO data is filled too, we should still display step 5
    expect(
      selectEtoStep(
        true,
        EEtoState.PREVIEW,
        true,
        EEtoMarketingDataVisibleInPreview.VISIBLE,
        false,
        true,
        true,
        false,
        false,
      ),
    ).to.eq(EEtoStep.UPLOAD_SIGNED_TERMSHEET);
  });

  it("should return step PUBLISH_INVESTMENT_OFFER if verification is done, state is PREVIEW, eto data is filled and term sheet has been submitted", () => {
    expect(
      selectEtoStep(
        true,
        EEtoState.PREVIEW,
        true,
        EEtoMarketingDataVisibleInPreview.VISIBLE,
        true,
        true,
        true,
        false,
        false,
      ),
    ).to.eq(EEtoStep.PUBLISH_INVESTMENT_OFFER);

    expect(
      selectEtoStep(
        true,
        EEtoState.PREVIEW,
        true,
        EEtoMarketingDataVisibleInPreview.NOT_VISIBLE,
        true,
        true,
        true,
        false,
        false,
      ),
    ).to.eq(EEtoStep.PUBLISH_INVESTMENT_OFFER);
  });

  it("should return step INVESTMENT_OFFER_IN_REVIEW when state is PENDING", () => {
    expect(
      selectEtoStep(
        true,
        EEtoState.PENDING,
        true,
        EEtoMarketingDataVisibleInPreview.VISIBLE,
        true,
        true,
        true,
        false,
        false,
      ),
    ).to.eq(EEtoStep.INVESTMENT_OFFER_IN_REVIEW);

    expect(
      selectEtoStep(
        true,
        EEtoState.PENDING,
        true,
        EEtoMarketingDataVisibleInPreview.NOT_VISIBLE,
        true,
        true,
        true,
        false,
        false,
      ),
    ).to.eq(EEtoStep.INVESTMENT_OFFER_IN_REVIEW);
  });

  it("should return step UPLOAD_OFFERING_DOCUMENT after investment offer was accepted", () => {
    // In Listed state
    expect(
      selectEtoStep(
        true,
        EEtoState.LISTED,
        true,
        EEtoMarketingDataVisibleInPreview.VISIBLE,
        true,
        true,
        true,
        false,
        false,
      ),
    ).to.eq(EEtoStep.UPLOAD_OFFERING_DOCUMENT);

    // In prospectus approved state
    expect(
      selectEtoStep(
        true,
        EEtoState.PROSPECTUS_APPROVED,
        true,
        EEtoMarketingDataVisibleInPreview.VISIBLE,
        true,
        true,
        true,
        false,
        false,
      ),
    ).to.eq(EEtoStep.UPLOAD_OFFERING_DOCUMENT);
  });

  it("should return step UPLOAD_ISHA after investment offer document was uploaded", () => {
    // In Listed state
    expect(
      selectEtoStep(
        true,
        EEtoState.LISTED,
        true,
        EEtoMarketingDataVisibleInPreview.VISIBLE,
        true,
        true,
        true,
        true,
        false,
      ),
    ).to.eq(EEtoStep.UPLOAD_ISHA);

    // In prospectus approved state
    expect(
      selectEtoStep(
        true,
        EEtoState.PROSPECTUS_APPROVED,
        true,
        EEtoMarketingDataVisibleInPreview.VISIBLE,
        true,
        true,
        true,
        true,
        false,
      ),
    ).to.eq(EEtoStep.UPLOAD_ISHA);
  });

  it("should return step WAIT_FOR_SMART_CONTRACT after ISHA was uploaded", () => {
    // In Listed state
    expect(
      selectEtoStep(
        true,
        EEtoState.LISTED,
        true,
        EEtoMarketingDataVisibleInPreview.VISIBLE,
        true,
        true,
        true,
        true,
        true,
      ),
    ).to.eq(EEtoStep.WAIT_FOR_SMART_CONTRACT);

    // In prospectus approved state
    expect(
      selectEtoStep(
        true,
        EEtoState.PROSPECTUS_APPROVED,
        true,
        EEtoMarketingDataVisibleInPreview.VISIBLE,
        true,
        true,
        true,
        true,
        true,
      ),
    ).to.eq(EEtoStep.WAIT_FOR_SMART_CONTRACT);
  });

  it("should return step REQUEST_THA_SIGN after contracts were deployed", () => {
    expect(
      selectEtoStep(
        true,
        EEtoState.ON_CHAIN,
        true,
        EEtoMarketingDataVisibleInPreview.VISIBLE,
        true,
        true,
        true,
        true,
        true,
      ),
    ).to.eq(EEtoStep.REQUEST_THA_SIGN);
  });
});
