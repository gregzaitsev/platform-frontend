import {
  assertEtoDashboard,
  generateRandomEmailAddress,
  loginWithLightWallet,
  logoutViaAccountMenu,
  registerWithLightWalletETO,
} from "../utils/index";

const password = "strongpassword";

const loginWithLightWalletETO = (testEmail: string, password: string) => {
  registerWithLightWalletETO(testEmail, password);
  assertEtoDashboard();

  logoutViaAccountMenu();
  loginWithLightWallet(testEmail, password);
  assertEtoDashboard();
};

describe("Light Wallet ETO Login", () => {
  beforeEach(() => {
    cy.clearLocalStorage();
  });
  it("should register logout then login as an investor", () => {
    const testEmail = generateRandomEmailAddress();
    loginWithLightWalletETO(testEmail, password);
  });
  it("should login/logout as investor navigate to ETO then login/logout as issuer", () => {
    const testEmail = generateRandomEmailAddress();
    loginWithLightWalletETO(testEmail, password);
  });
});
