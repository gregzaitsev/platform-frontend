import { kycRoutes } from "../../components/kyc/routes";
import { goThroughKycCorporateProcess } from "../utils";
import { tid } from "../utils/selectors";
import { createAndLoginNewUser } from "../utils/userHelpers";

describe("KYC Small Business flow with manual verification", () => {
  it("went through KYC Small Business flow", () => {
    createAndLoginNewUser({ type: "investor" }).then(() => {
      // go to corporate start page
      cy.visit(kycRoutes.start);
      cy.get(tid("kyc-start-go-to-company")).awaitedClick();

      // fill out and submit business form
      fillForm(kycCorporateCompanyForm);
      fillForm(kycCompanyDocsForm);

      // uplaod legal rep data
      fillForm(kycLegalRepForm);
      fillForm(kycLegalRepDocsForm, { submit: false });

      // TODO: Enable after we know what happened on the backend
      // // add a new beneficial owner entry
      // cy.get(tid("kyc-beneficial-owner-add-new")).awaitedClick();
      // // remove him again
      // cy.get(tid("kyc-beneficial-owner-delete")).awaitedClick();

      // submit and accept
      cy.get(tid("kyc-company-legal-representative-upload-and-submit")).awaitedClick();
      confirmAccessModal();

      // panel should now be in pending state
      cy.get(tid("kyc-panel-pending"));
    });
  });
});
