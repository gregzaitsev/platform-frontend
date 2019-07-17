import {
  assertNomineeDashboard,
  generateRandomEmailAddress,
  loginWithLightWallet,
  logoutViaAccountMenu,
  registerWithLightWalletNominee,
} from "../utils/index";

describe("Nominee flow", () => {
  const password = "strongpassword";
  const email = generateRandomEmailAddress();

  it("should register nominee with light-wallet, let them logout and login again", () => {
    cy.clearLocalStorage();
    registerWithLightWalletNominee(email, password);
    assertNomineeDashboard();

    logoutViaAccountMenu();
    loginWithLightWallet(email, password);
    assertNomineeDashboard();
  });
});
