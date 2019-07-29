import { etoRegisterRoutes } from "../../components/eto/registration/routes";
import { assertEtoDashboard } from "../utils/assertions";
import { fillForm } from "../utils/forms";
import { goToEtoPreview } from "../utils/navigation";
import { formField, tid } from "../utils/selectors";
import { createAndLoginNewUser } from "../utils/userHelpers";
import { aboutFormRequired, aboutFormSubmit } from "./fixtures";

describe("Eto Company Information Rich Text Editor", () => {
  before(() => {
    createAndLoginNewUser({ type: "issuer", kyc: "business" });
    cy.saveLocalStorage();
  });

  beforeEach(() => {
    cy.restoreLocalStorage();
  });

  it("should render field as rich-text", () => {
    cy.visit(etoRegisterRoutes.companyInformation);
    cy.get(tid("eto.form.company-information")).should("exist");

    fillForm(
      {
        ...aboutFormRequired,
      },
      { submit: false },
    );

    cy.get(formField("companyDescription")).clear();
    cy.get(".ck.ck-toolbar > :nth-child(3)").click();
    cy.get(formField("companyDescription")).type("This is a bold text{enter}");

    fillForm(aboutFormSubmit);

    assertEtoDashboard();

    goToEtoPreview();

    cy.get(tid("eto-view-company-description"))
      .get("strong")
      .contains("This is a bold text");
  });

  it("should add aria attributes", () => {
    cy.visit(etoRegisterRoutes.companyInformation);
    cy.get(tid("eto.form.company-information")).should("exist");

    const companyDescriptionName = "companyDescription";

    cy.get(formField(companyDescriptionName)).then($richTextEditor => {
      expect($richTextEditor).to.have.id(companyDescriptionName);

      expect($richTextEditor).to.have.attr("aria-invalid", "false");
      expect($richTextEditor).to.have.attr("aria-multiline", "true");

      const companyDescriptionLabelId = `${companyDescriptionName}-label`;
      cy.get(`#${companyDescriptionLabelId}`).should("exist");
      expect($richTextEditor).to.have.attr("aria-labeledby", companyDescriptionLabelId);
    });

    // show required error
    cy.get(formField(companyDescriptionName))
      // clear previous content
      .clear()
      .type("Sunt tataes prensionem varius, regius turpises.")
      .clear();

    cy.get(formField(companyDescriptionName)).then($richTextEditor => {
      expect($richTextEditor).to.have.attr("aria-invalid", "true");

      const companyDescriptionErrorId = `${companyDescriptionName}-error-message`;
      cy.get(`#${companyDescriptionErrorId}`).should("exist");
      expect($richTextEditor).to.have.attr("aria-describedby", companyDescriptionErrorId);
    });
  });
});
