import {
  assertDashboard,
  assertVerifyEmailWidgetIsInNoEmailState,
  assertVerifyEmailWidgetIsInUnverifiedEmailState,
  assertVerifyEmailWidgetIsInVerfiedEmailState,
  closeModal,
  confirmAccessModal,
  generateRandomEmailAddress,
  goToUserAccountSettings,
  registerWithLightWallet,
  tid,
  verifyLatestUserEmail,
} from "../utils";

describe("Verify Email Widget", () => {
  beforeEach(() => {
    cy.clearLocalStorage();
  });
  it("should change user email after register", () => {
    const firstEmail = generateRandomEmailAddress();
    const secondEmail = generateRandomEmailAddress();
    const password = "strongpassword";

    registerWithLightWallet(firstEmail, password);
    assertDashboard();

    goToUserAccountSettings();
    assertVerifyEmailWidgetIsInUnverifiedEmailState();
    cy.get(tid("verify-email-widget.change-email.button")).awaitedClick();
    assertVerifyEmailWidgetIsInNoEmailState();

    cy.get(tid("verify-email-widget-form-email-input")).type(secondEmail);
    cy.get(tid("verify-email-widget-form-submit")).awaitedClick();

    confirmAccessModal();

    // Email server takes time before getting the request
    cy.wait(3000);
    verifyLatestUserEmail(secondEmail);

    assertVerifyEmailWidgetIsInVerfiedEmailState();
    assertVerifyEmailWidgetIsInUnverifiedEmailState(true);
    assertVerifyEmailWidgetIsInNoEmailState(true);
  });

  it("should not send a request when access modal is cancelled", () => {
    const firstEmail = generateRandomEmailAddress();
    const secondEmail = generateRandomEmailAddress();
    const password = "strongpassword";

    registerWithLightWallet(firstEmail, password);
    assertDashboard();

    goToUserAccountSettings();
    assertVerifyEmailWidgetIsInUnverifiedEmailState();
    cy.get(tid("verify-email-widget.change-email.button")).awaitedClick();
    assertVerifyEmailWidgetIsInNoEmailState();

    cy.get(tid("verify-email-widget-form-email-input")).type(secondEmail);
    cy.get(tid("verify-email-widget-form-submit")).awaitedClick();

    closeModal();
  });
});
