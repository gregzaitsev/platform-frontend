import { etoPublicViewByIdLinkLegacy, etoPublicViewLink } from "../../components/appRouteUtils";
import { confirmAccessModal, etoFixtureAddressByName } from "../utils";
import { fillForm } from "../utils/forms";
import { tid } from "../utils/selectors";
import { getEto, loginFixtureAccount } from "../utils/userHelpers";

const fillBookBuildingForm = (amount: string, confirmModal: boolean = true) => {
  fillForm({
    amount,
    "eto-bookbuilding-commit": {
      type: "submit",
    },
  });

  if (confirmModal) {
    confirmAccessModal();
  }
  cy.get(`${tid("campaigning-your-commitment")} ${tid("value")}`).should("contain", amount);
};

const changeBookBuilding = () => cy.get(tid("campaigning-your-commitment-change")).click();

const deleteBookBuilding = () => {
  cy.get(tid("campaigning-your-commitment-delete")).click();
  cy.get(tid("campaigning-your-commitment")).should("not.exist");
};

describe("Bookbuilding", () => {
  before(() => {
    loginFixtureAccount("INV_ETH_EUR_ICBM_M_HAS_KYC", {
      kyc: "business",
      onlyLogin: true,
    });
    cy.saveLocalStorage();
  });

  beforeEach(() => {
    cy.restoreLocalStorage();
  });
  it("should allow to change pledge by investor", () => {
    const ETO_ID = etoFixtureAddressByName("ETOInSetupState");

    cy.visit(etoPublicViewByIdLinkLegacy(ETO_ID));

    fillBookBuildingForm("200");
    changeBookBuilding();
    fillBookBuildingForm("160", false);
    deleteBookBuilding();
  });

  it("load pledge data correclty", () => {
    const amount = "200";
    const ETO_ID = etoFixtureAddressByName("ETOInSetupState");
    cy.visit(etoPublicViewByIdLinkLegacy(ETO_ID));

    fillBookBuildingForm(amount);

    getEto(ETO_ID).then(etoData => {
      // Preview code
      cy.visit(etoPublicViewLink(etoData.previewCode, etoData.product.jurisdiction));
      cy.get(`${tid("campaigning-your-commitment")} ${tid("value")}`).should("contain", amount);

      // from dashboard
      cy.visit("/");
      cy.get(tid(`eto-overview-${ETO_ID}`)).click();
      cy.get(`${tid("campaigning-your-commitment")} ${tid("value")}`).should("contain", amount);

      // from dashboard
      cy.visit(etoPublicViewByIdLinkLegacy(ETO_ID));
      cy.get(`${tid("campaigning-your-commitment")} ${tid("value")}`).should("contain", amount);
    });
  });
});
