import { assertEtoDocuments } from "../utils/assertions";
import {
  checkForm,
  fillForm,
  TFormFixture,
  TFormFixtureExpectedValues,
  uploadDocumentToFieldWithTid,
} from "../utils/forms";
import { goToEtoDashboard } from "../utils/navigation";
import { tid } from "../utils/selectors";
import { createAndLoginNewUser } from "../utils/userHelpers";
import { createAndSetNominee, fillAndAssert, submitProposal } from "./EtoRegistrationUtils";
import {
  aboutFormRequired,
  aboutFormSubmit,
  equityTokenInfoForm,
  etoTermsRequiredForm,
  etoTermsRequiredFormExpectedValues,
  investmentTermsRequiredForm,
  investmentTermsRequiredFormExpectedResult,
  legalInfoRequiredForm,
  mediaRequiredForm,
  votingRights,
} from "./fixtures";

const openAndCheckValues = (
  section: string,
  sectionForm: TFormFixture,
  expectedValues?: TFormFixtureExpectedValues,
) => {
  cy.get(`${tid(section)} button`).click();
  checkForm(sectionForm, expectedValues);
  goToEtoDashboard();
};

describe("Eto Forms", () => {
  it("should fill required fields and submit eto", function(): void {
    createAndLoginNewUser({ type: "issuer", kyc: "business" }).then(async () => {
      goToEtoDashboard();

      cy.get(tid("eto-progress-widget-eto-terms")).should("not.exist");

      // Fill marketing data first

      fillAndAssert("eto-progress-widget-about", {
        ...aboutFormRequired,
        ...aboutFormSubmit,
      });

      fillAndAssert("eto-progress-widget-legal-info", legalInfoRequiredForm);

      fillAndAssert("eto-progress-widget-equity-token-info", equityTokenInfoForm);

      fillAndAssert("eto-progress-widget-media", mediaRequiredForm);

      // Connect nominee with issuer
      createAndSetNominee();

      // Now eto settings should be available
      cy.get(tid("eto-progress-widget-eto-terms")).should("exist");

      // Fill eto settings
      fillAndAssert("eto-progress-widget-investment-terms", investmentTermsRequiredForm);

      fillAndAssert("eto-progress-widget-eto-terms", etoTermsRequiredForm);

      fillAndAssert("eto-progress-widget-voting-right", votingRights);

      // some checks to make sure the values in already saved forms are displayed correctly
      openAndCheckValues(
        "eto-progress-widget-investment-terms",
        investmentTermsRequiredForm,
        investmentTermsRequiredFormExpectedResult,
      );
      openAndCheckValues(
        "eto-progress-widget-eto-terms",
        etoTermsRequiredForm,
        etoTermsRequiredFormExpectedValues,
      );

      cy.get(tid("dashboard-upload-termsheet")).click();
      assertEtoDocuments();

      const documentsForm: TFormFixture = {
        "form.name.signed_termsheet": {
          value: "example.pdf",
          method: "document",
          type: "custom",
        },
      };

      fillForm(documentsForm, {
        submit: false,
        methods: { document: uploadDocumentToFieldWithTid },
      });

      submitProposal();
    });
  });
});
