import { appRoutes } from "../../components/appRoutes";
import { kycRoutes } from "../../components/kyc/routes";
import { fillForm } from "../utils/forms";
import { tid } from "../utils/selectors";
import { createAndLoginNewUser } from "../utils/userHelpers";
import { kycInvidualForm } from "./fixtures";

const initiateIDNowKyc = () => {
  // go to kyc select and then individual page
  cy.visit(kycRoutes.start);

  cy.get(tid("kyc-start-go-to-personal")).awaitedClick();

  cy.url().should("contain", kycRoutes.individualStart);

  // fill and submit the form
  fillForm(kycInvidualForm);

  cy.get(tid("kyc-go-to-outsourced-verification")).awaitedClick();

  // There is nothing we can await in the DOM in this case
  // Without wait() request is cancelled because of `cy.visit` called later
  cy.wait(1000);
};

describe("KYC Personal flow with ID Now", () => {
  it("should go through ID Now Cancel then try ID now again", () => {
    createAndLoginNewUser({ type: "investor" }).then(() => {
      initiateIDNowKyc();

      cy.visit(appRoutes.profile);
      cy.get(tid("settings.kyc-status-widget.cancel-external-kyc-button")).awaitedClick(1500);

      // Without wait() request is cancelled because of `cy.visit` called later
      cy.wait(1000);
      //Second Time
      initiateIDNowKyc();

      cy.visit(appRoutes.profile);
      cy.get(tid("settings.kyc-status-widget.cancel-external-kyc-button")).should("exist");
    });
  });
});
