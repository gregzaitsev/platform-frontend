import { etoPublicViewByIdLinkLegacy } from "../../components/appRouteUtils";
import { formatThousands } from "../../components/shared/formatters/utils";
import {
  assertRegister,
  confirmAccessModal,
  etoFixtureAddressByName,
  goToIssuerDashboard,
} from "../utils";
import { fillForm } from "../utils/forms";
import { tid } from "../utils/selectors";
import {
  createAndLoginNewUser,
  loginFixtureAccount,
  logout,
  makeAuthenticatedCall,
} from "../utils/userHelpers";

const PLEDGE_AMOUNT = "1000";
const CHANGED_AMOUNT = "1500";

describe("Eto campaigning state", () => {
  it("should show Register button when not logged in", () => {
    const ETO_ID = etoFixtureAddressByName("ETONoStartDate");

    cy.visit(etoPublicViewByIdLinkLegacy(ETO_ID));
    cy.get(tid("eto.public-view")).should("exist");

    cy.get(tid("logged-out-campaigning-register")).awaitedClick();

    assertRegister();
  });

  it("should allow to pledge by investor", () => {
    // eto ID must match issuer SEED below
    const ETO_ID = etoFixtureAddressByName("ETOInSetupState");

    loginFixtureAccount("ISSUER_SETUP", {
      kyc: "business",
      permissions: ["do-bookbuilding"],
    }).then(() =>
      // make sure bookbuilding is off (especially after CI retry)
      makeAuthenticatedCall("/api/eto-listing/etos/me/bookbuilding", {
        method: "PUT",
        body: JSON.stringify({
          is_bookbuilding: false,
        }),
      }).then(() => {
        goToIssuerDashboard();

        cy.get(tid("eto-state-countdown_to_public_sale")).should("exist");

        cy.get(tid("eto-flow-start-bookbuilding")).awaitedClick();

        cy.get(tid("eto-state-whitelisting")).should("exist");

        logout();

        createAndLoginNewUser({
          type: "investor",
          kyc: "business",
        }).then(() => {
          cy.visit(etoPublicViewByIdLinkLegacy(ETO_ID));

          cy.get(tid("eto-bookbuilding-remaining-slots"))
            .then($element => Number($element.text()))
            .as("remainingSlots");

          fillForm({
            amount: PLEDGE_AMOUNT,
            consentToRevealEmail: {
              type: "radio",
              value: "true",
            },
            "eto-bookbuilding-commit": { type: "submit" },
          });

          confirmAccessModal();

          cy.get(tid("campaigning-your-commitment")).contains(
            `${formatThousands(PLEDGE_AMOUNT)} EUR`,
          );
          cy.get<number>("@remainingSlots").then(remainingSlots => {
            // Remove one from remaining slots as it's first pledge
            cy.get(tid("eto-bookbuilding-remaining-slots")).should("contain", remainingSlots - 1);
          });

          logout();

          createAndLoginNewUser({
            type: "investor",
            kyc: "individual",
          }).then(() => {
            cy.visit(etoPublicViewByIdLinkLegacy(ETO_ID));

            fillForm({
              amount: CHANGED_AMOUNT,
              "eto-bookbuilding-commit": { type: "submit" },
            });

            confirmAccessModal();

            cy.get(tid("campaigning-your-commitment")).contains(
              `${formatThousands(CHANGED_AMOUNT)} EUR`,
            );
            cy.get<number>("@remainingSlots").then(remainingSlots => {
              // Remove two from remaining slots as it's second pledge
              cy.get(tid("eto-bookbuilding-remaining-slots")).should("contain", remainingSlots - 2);
            });
          });
        });
      }),
    );
  });

  it("should allow to change pledge by investor", () => {
    const ETO_ID = etoFixtureAddressByName("ETOInSetupState");

    loginFixtureAccount("INV_ETH_EUR_ICBM_M_HAS_KYC", {
      kyc: "business",
    }).then(() => {
      cy.visit(etoPublicViewByIdLinkLegacy(ETO_ID));

      const amount = "200";
      fillForm({
        amount,
        "eto-bookbuilding-commit": {
          type: "submit",
        },
      });
      confirmAccessModal();
      cy.get(`${tid("campaigning-your-commitment")} ${tid("value")}`).should("contain", amount);
      cy.get(tid("campaigning-your-commitment-change")).click();

      const newAmount = "160";
      fillForm({
        amount: newAmount,
        "eto-bookbuilding-commit": {
          type: "submit",
        },
      });
      cy.get(`${tid("campaigning-your-commitment")} ${tid("value")}`).should("contain", newAmount);

      cy.get(tid("campaigning-your-commitment-delete")).click();

      cy.get(tid("campaigning-your-commitment")).should("not.exist");
    });
  });
});
