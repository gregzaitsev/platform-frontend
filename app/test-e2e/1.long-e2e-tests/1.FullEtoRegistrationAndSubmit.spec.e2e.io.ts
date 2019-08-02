import { createAndSetNominee, fillAndAssertFull } from "../eto-registration/EtoRegistrationUtils";
import {
  aboutForm,
  equityTokenInfoForm,
  etoKeyIndividualsForm,
  etoTermsForm,
  investmentTermsForm,
  legalInfoForm,
  mediaForm,
  productVisionForm,
  votingRights,
} from "../eto-registration/fixtures";
import { assertEtoDashboard } from "../utils";
import { fillForm } from "../utils/forms";
import { goToEtoDashboard } from "../utils/navigation";
import { tid } from "../utils/selectors";
import { createAndLoginNewUser } from "../utils/userHelpers";

describe("Eto Forms", () => {
  before(() => {
    createAndLoginNewUser({ type: "issuer", kyc: "business" });
    cy.saveLocalStorage();
  });
  beforeEach(() => {
    cy.restoreLocalStorage();
    goToEtoDashboard();
  });

  it("will fill and submit about", () => {
    cy.get(tid("eto-progress-widget-eto-terms")).should("not.exist");
    // Fill marketing data first
    fillAndAssertFull("eto-progress-widget-about", aboutForm);
  });

  it("will fill and submit legal-info", () => {
    fillAndAssertFull("eto-progress-widget-legal-info", legalInfoForm);
  });
  it("will fill and submit equityTokenInfoForm", () => {
    fillAndAssertFull("eto-progress-widget-equity-token-info", equityTokenInfoForm);
  });
  it("will fill and submit product vision", () => {
    fillAndAssertFull("eto-progress-widget-product-vision", productVisionForm);
  });

  it("will fill and submit media form", () => {
    fillAndAssertFull("eto-progress-widget-media", mediaForm);
  });

  it("will fill and submit key individuals", () => {
    cy.get(`${tid("eto-progress-widget-key-individuals")} button`).awaitedClick();
    // first click on all the add buttons to open the fields
    cy.get(tid("key-individuals-group-button-team")).click();
    cy.get(tid("key-individuals-group-button-advisors")).awaitedClick();
    cy.get(tid("key-individuals-group-button-keyAlliances")).awaitedClick();
    cy.get(tid("key-individuals-group-button-boardMembers")).awaitedClick();
    cy.get(tid("key-individuals-group-button-notableInvestors")).awaitedClick();
    cy.get(tid("key-individuals-group-button-keyCustomers")).awaitedClick();
    cy.get(tid("key-individuals-group-button-partners")).awaitedClick();
    fillForm(etoKeyIndividualsForm);

    assertEtoDashboard();
    cy.get(`${tid("eto-progress-widget-key-individuals")} ${tid("chart-circle.progress")}`).should(
      "contain",
      "100%",
    );
  });

  it("will find eto terms and fill investment terms", () => {
    // hidden for now as requested in #2633
    // fillAndAssertFull("eto-progress-widget-risk-assessment", riskForm);

    // Now eto settings should be available
    cy.get(tid("eto-progress-widget-eto-terms")).should("exist");

    // Fill eto settings

    fillAndAssertFull("eto-progress-widget-investment-terms", investmentTermsForm);
  });

  it("will fill and submit eto terms", () => {
    fillAndAssertFull("eto-progress-widget-eto-terms", () => {
      fillForm(
        {
          productId: {
            value: "retail eto li security",
            type: "radio",
          },
        },
        { submit: false },
      );

      cy.get(tid("eto-flow-product-changed-successfully"));

      fillForm(etoTermsForm);
    });
  });

  it("will fill and submit voting rights", () => {
    // Connect nominee with issuer
    createAndSetNominee();

    fillAndAssertFull("eto-progress-widget-voting-right", votingRights);
  });
});
