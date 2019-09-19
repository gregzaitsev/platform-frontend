import { expect } from "chai";

import {
  EEtoMarketingDataVisibleInPreview,
  EEtoState,
} from "../../lib/api/eto/EtoApi.interfaces.unsafe";
import { EETOStateOnChain } from "../../modules/eto/types";
import { EEtoStep, selectEtoStep } from "./utils";

describe("selectEtoStep", () => {
  it("should return verification step if verification is not done", () => {
    expect(
      selectEtoStep(
        false,
        EEtoState.PREVIEW,
        undefined,
        false,
        EEtoMarketingDataVisibleInPreview.NOT_VISIBLE,
        false,
        false,
        false,
        false,
        false,
        false,
        undefined,
      ),
    ).to.eq(EEtoStep.VERIFICATION);

    // Even for impossible states
    expect(
      selectEtoStep(
        false,
        EEtoState.LISTED,
        undefined,
        true,
        EEtoMarketingDataVisibleInPreview.VISIBLE,
        true,
        true,
        true,
        false,
        false,
        false,
        undefined,
      ),
    ).to.eq(EEtoStep.VERIFICATION);
  });

  it("should return FILL_INFORMATION_ABOUT_COMPANY step if verification is done and state is PREVIEW", () => {
    expect(
      selectEtoStep(
        true,
        EEtoState.PREVIEW,
        undefined,
        false,
        EEtoMarketingDataVisibleInPreview.NOT_VISIBLE,
        false,
        false,
        false,
        false,
        false,
        false,
        undefined,
      ),
    ).to.eq(EEtoStep.FILL_INFORMATION_ABOUT_COMPANY);
  });

  it("should return PUBLISH_LISTING_PAGE if verification is done, state is PREVIEW and marketing data is filled", () => {
    expect(
      selectEtoStep(
        true,
        EEtoState.PREVIEW,
        undefined,
        true,
        EEtoMarketingDataVisibleInPreview.NOT_VISIBLE,
        false,
        false,
        false,
        false,
        false,
        false,
        undefined,
      ),
    ).to.eq(EEtoStep.PUBLISH_LISTING_PAGE);
  });

  it("should return LISTING_PAGE_IN_REVIEW step if verification is done, state is PREVIEW, marketing data is filled and marketing data is in PENDING state", () => {
    expect(
      selectEtoStep(
        true,
        EEtoState.PREVIEW,
        undefined,
        true,
        EEtoMarketingDataVisibleInPreview.VISIBILITY_PENDING,
        false,
        false,
        false,
        false,
        false,
        false,
        undefined,
      ),
    ).to.eq(EEtoStep.LISTING_PAGE_IN_REVIEW);

    // If ETO data is filled too, we should still display step 4
    expect(
      selectEtoStep(
        true,
        EEtoState.PREVIEW,
        undefined,
        true,
        EEtoMarketingDataVisibleInPreview.VISIBILITY_PENDING,
        false,
        true,
        true,
        false,
        false,
        false,
        undefined,
      ),
    ).to.eq(EEtoStep.LISTING_PAGE_IN_REVIEW);
  });

  it("should return LINK_NOMINEE if verification is done, state is PREVIEW and only investment and eto terms are filled", () => {
    expect(
      selectEtoStep(
        true,
        EEtoState.PREVIEW,
        undefined,
        true,
        EEtoMarketingDataVisibleInPreview.NOT_VISIBLE,
        false,
        false,
        true,
        false,
        false,
        false,
        undefined,
      ),
    ).to.eq(EEtoStep.LINK_NOMINEE);
  });

  it("should return UPLOAD_SIGNED_TERMSHEET step if verification is done, state is PREVIEW, eto data is filled (including nominee)", () => {
    expect(
      selectEtoStep(
        true,
        EEtoState.PREVIEW,
        undefined,
        true,
        EEtoMarketingDataVisibleInPreview.VISIBLE,
        false,
        true,
        true,
        false,
        false,
        false,
        undefined,
      ),
    ).to.eq(EEtoStep.UPLOAD_SIGNED_TERMSHEET);

    // If ETO data is filled too, we should still display step 5
    expect(
      selectEtoStep(
        true,
        EEtoState.PREVIEW,
        undefined,
        true,
        EEtoMarketingDataVisibleInPreview.VISIBLE,
        false,
        true,
        true,
        false,
        false,
        false,
        undefined,
      ),
    ).to.eq(EEtoStep.UPLOAD_SIGNED_TERMSHEET);
  });

  it("should return step PUBLISH_INVESTMENT_OFFER if verification is done, state is PREVIEW, eto data is filled and term sheet has been submitted", () => {
    expect(
      selectEtoStep(
        true,
        EEtoState.PREVIEW,
        undefined,
        true,
        EEtoMarketingDataVisibleInPreview.VISIBLE,
        true,
        true,
        true,
        false,
        false,
        false,
        undefined,
      ),
    ).to.eq(EEtoStep.PUBLISH_INVESTMENT_OFFER);

    expect(
      selectEtoStep(
        true,
        EEtoState.PREVIEW,
        undefined,
        true,
        EEtoMarketingDataVisibleInPreview.NOT_VISIBLE,
        true,
        true,
        true,
        false,
        false,
        false,
        undefined,
      ),
    ).to.eq(EEtoStep.PUBLISH_INVESTMENT_OFFER);
  });

  it("should return step INVESTMENT_OFFER_IN_REVIEW when state is PENDING", () => {
    expect(
      selectEtoStep(
        true,
        EEtoState.PENDING,
        undefined,
        true,
        EEtoMarketingDataVisibleInPreview.VISIBLE,
        true,
        true,
        true,
        false,
        false,
        false,
        undefined,
      ),
    ).to.eq(EEtoStep.INVESTMENT_OFFER_IN_REVIEW);

    expect(
      selectEtoStep(
        true,
        EEtoState.PENDING,
        undefined,
        true,
        EEtoMarketingDataVisibleInPreview.NOT_VISIBLE,
        true,
        true,
        true,
        false,
        false,
        false,
        undefined,
      ),
    ).to.eq(EEtoStep.INVESTMENT_OFFER_IN_REVIEW);
  });

  it("should return step UPLOAD_OFFERING_DOCUMENT after investment offer was accepted", () => {
    // In Listed state
    expect(
      selectEtoStep(
        true,
        EEtoState.LISTED,
        undefined,
        true,
        EEtoMarketingDataVisibleInPreview.VISIBLE,
        true,
        true,
        true,
        false,
        false,
        false,
        undefined,
      ),
    ).to.eq(EEtoStep.UPLOAD_OFFERING_DOCUMENT);

    // In prospectus approved state
    expect(
      selectEtoStep(
        true,
        EEtoState.PROSPECTUS_APPROVED,
        undefined,
        true,
        EEtoMarketingDataVisibleInPreview.VISIBLE,
        true,
        true,
        true,
        false,
        false,
        false,
        undefined,
      ),
    ).to.eq(EEtoStep.UPLOAD_OFFERING_DOCUMENT);
  });

  it("should return step UPLOAD_ISHA after investment offer document was uploaded", () => {
    // In Listed state
    expect(
      selectEtoStep(
        true,
        EEtoState.LISTED,
        undefined,
        true,
        EEtoMarketingDataVisibleInPreview.VISIBLE,
        true,
        true,
        true,
        true,
        false,
        false,
        undefined,
      ),
    ).to.eq(EEtoStep.UPLOAD_ISHA);

    // In prospectus approved state
    expect(
      selectEtoStep(
        true,
        EEtoState.PROSPECTUS_APPROVED,
        undefined,
        true,
        EEtoMarketingDataVisibleInPreview.VISIBLE,
        true,
        true,
        true,
        true,
        false,
        false,
        undefined,
      ),
    ).to.eq(EEtoStep.UPLOAD_ISHA);
  });

  it("should return step WAIT_FOR_SMART_CONTRACT after ISHA was uploaded", () => {
    // In Listed state
    expect(
      selectEtoStep(
        true,
        EEtoState.LISTED,
        undefined,
        true,
        EEtoMarketingDataVisibleInPreview.VISIBLE,
        true,
        true,
        true,
        true,
        true,
        false,
        undefined,
      ),
    ).to.eq(EEtoStep.WAIT_FOR_SMART_CONTRACT);

    // In prospectus approved state
    expect(
      selectEtoStep(
        true,
        EEtoState.PROSPECTUS_APPROVED,
        undefined,
        true,
        EEtoMarketingDataVisibleInPreview.VISIBLE,
        true,
        true,
        true,
        true,
        true,
        false,
        undefined,
      ),
    ).to.eq(EEtoStep.WAIT_FOR_SMART_CONTRACT);
  });

  it("should return step WAIT_FOR_NOMINEE_AGREEMENTS after contracts were deployed", () => {
    expect(
      selectEtoStep(
        true,
        EEtoState.ON_CHAIN,
        EETOStateOnChain.Setup,
        true,
        EEtoMarketingDataVisibleInPreview.VISIBLE,
        true,
        true,
        true,
        true,
        true,
        false,
        undefined,
      ),
    ).to.eq(EEtoStep.WAIT_FOR_NOMINEE_AGREEMENTS);
  });

  it("should return step WAIT_FOR_NOMINEE_AGREEMENTS after contracts were deployed", () => {
    expect(
      selectEtoStep(
        true,
        EEtoState.ON_CHAIN,
        EETOStateOnChain.Setup,
        true,
        EEtoMarketingDataVisibleInPreview.VISIBLE,
        true,
        true,
        true,
        true,
        true,
        false,
        undefined,
      ),
    ).to.eq(EEtoStep.WAIT_FOR_NOMINEE_AGREEMENTS);
  });

  it("should return step SETUP_START_DATE after nominee sign agreements", () => {
    expect(
      selectEtoStep(
        true,
        EEtoState.ON_CHAIN,
        EETOStateOnChain.Setup,
        true,
        EEtoMarketingDataVisibleInPreview.VISIBLE,
        true,
        true,
        true,
        true,
        true,
        true,
        undefined,
      ),
    ).to.eq(EEtoStep.SETUP_START_DATE);
  });

  it("should return step WAITING_FOR_FUNDRAISING_TO_START after eto start date has been set", () => {
    expect(
      selectEtoStep(
        true,
        EEtoState.ON_CHAIN,
        EETOStateOnChain.Setup,
        true,
        EEtoMarketingDataVisibleInPreview.VISIBLE,
        true,
        true,
        true,
        true,
        true,
        true,
        new Date("10/3/2019"),
      ),
    ).to.eq(EEtoStep.WAITING_FOR_FUNDRAISING_TO_START);
  });

  it("should return step FUNDRAISING_IS_LIVE eto start date has been set", () => {
    expect(
      selectEtoStep(
        true,
        EEtoState.ON_CHAIN,
        EETOStateOnChain.Whitelist,
        true,
        EEtoMarketingDataVisibleInPreview.VISIBLE,
        true,
        true,
        true,
        true,
        true,
        true,
        new Date("10/3/2019"),
      ),
    ).to.eq(EEtoStep.FUNDRAISING_IS_LIVE);
  });
});
