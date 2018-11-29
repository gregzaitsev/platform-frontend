import { appRoutes } from "../../components/appRoutes";
import { extractNumber } from "../../utils/StringUtils";
import { withParams } from "../../utils/withParams";
import { ISSUER_SETUP } from "../constants";
import { etoFixtureAddressByName } from "../utils";
import { assertRegister, confirmAccessModal } from "../utils";
import { fillForm } from "../utils/forms";
import { tid } from "../utils/selectors";
import { createAndLoginNewUser, logout, makeAuthenticatedCall } from "../utils/userHelpers";

describe("Eto campaining state", () => {
  it("should show Register button when not logged in", () => {
    const ETO_ID = etoFixtureAddressByName("ETONoStartDate")!;

    cy.visit(withParams(appRoutes.etoPublicViewById, { etoId: ETO_ID }));
    cy.get(tid("eto.public-view")).should("exist");

    cy.get(tid("logged-out-campaigning-register")).awaitedClick();

    assertRegister();
  });

  it("should show founders quote when logged in and campaigning date is not set", () => {
    const ETO_ID = etoFixtureAddressByName("ETONoStartDate")!;

    createAndLoginNewUser({
      type: "issuer",
      kyc: "business",
    }).then(() => {
      cy.visit(withParams(appRoutes.etoPublicViewById, { etoId: ETO_ID }));
      cy.get(tid("eto.public-view")).should("exist");

      cy.get(tid("eto-overview-status-founders-quote")).should("exist");
    });
  });

  it("should allow to pledge by investor", () => {
    // eto ID must match issuer SEED below
    const ETO_ID = etoFixtureAddressByName("ETOInSetupState")!;

    createAndLoginNewUser({
      type: "issuer",
      kyc: "business",
      seed: ISSUER_SETUP,
      permissions: ["do-bookbuilding"],
    }).then(() => {
      // make sure bookbuilding is off (especially after CI retry)
      return makeAuthenticatedCall("/api/eto-listing/etos/me/bookbuilding", {
        method: "PUT",
        body: JSON.stringify({
          is_bookbuilding: false,
        }),
      }).then(() => {
        cy.visit(appRoutes.dashboard);

        cy.get(tid("eto-flow-start-bookbuilding")).awaitedClick();

        // give it a chance to settle before logging out
        cy.wait(5000);
        logout();

        cy.reload();
        cy.wait(1000);
        createAndLoginNewUser({
          type: "investor",
          kyc: "business",
        }).then(() => {
          cy.wait(1000);
          cy.reload();

          cy.visit(withParams(appRoutes.etoPublicViewById, { etoId: ETO_ID }));

          let amount: number;
          let freeSlots: number;
          cy.get(tid("eto-bookbuilding-amount-backed")).should($e => {
            amount = parseInt(extractNumber($e.text().trim()));
            expect(Number.isNaN(amount)).to.be.false;
          });
          cy.get(tid("eto-bookbuilding-remaining-slots")).should($e => {
            freeSlots = parseInt(extractNumber($e.text().trim()));
            expect(Number.isNaN(amount)).to.be.false;
          });

          fillForm({
            amount: "1000",
            consentToRevealEmail: {
              type: "radio",
              value: "true",
            },
            "eto-bookbuilding-back-now": { type: "submit" },
          });

          confirmAccessModal();

          cy.get(tid("eto-bookbuilding-amount-backed")).should($e => {
            const newAmount = parseInt(extractNumber($e.text().trim()));
            expect(newAmount).to.equal(amount + 1000);
            amount = newAmount;
          });
          cy.get(tid("eto-bookbuilding-remaining-slots")).should($e => {
            const newFreeSlots = parseInt(extractNumber($e.text().trim()));
            expect(newFreeSlots).to.equal(freeSlots - 1);
            freeSlots = newFreeSlots;
          });

          // give it a chance to settle before logging out
          cy.wait(5000);

          logout();

          cy.reload();
          cy.wait(1000);
          createAndLoginNewUser({
            type: "investor",
            kyc: "business",
          }).then(() => {
            cy.wait(1000);
            cy.reload();

            cy.visit(withParams(appRoutes.etoPublicViewById, { etoId: ETO_ID }));
            fillForm({
              amount: "1500",
              "eto-bookbuilding-back-now": { type: "submit" },
            });

            confirmAccessModal();

            cy.get(tid("eto-bookbuilding-amount-backed")).should($e => {
              const newAmount = parseInt(extractNumber($e.text().trim()));
              expect(newAmount).to.equal(amount + 1500);
              amount = newAmount;
            });
            cy.get(tid("eto-bookbuilding-remaining-slots")).should($e => {
              const newFreeSlots = parseInt(extractNumber($e.text().trim()));
              expect(newFreeSlots).to.equal(freeSlots - 1);
              freeSlots = newFreeSlots;
            });
          });
        });
      });
    });
  });
});
