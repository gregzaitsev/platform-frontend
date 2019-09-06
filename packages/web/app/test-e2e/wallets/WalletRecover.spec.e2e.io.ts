import { recoverRoutes } from "../../components/wallet-selector/wallet-recover/router/recoverRoutes";
import {
  acceptTOS,
  assertDashboard,
  assertErrorModal,
  assertWaitForLatestEmailSentWithSalt,
  createAndLoginNewUser,
  generateRandomEmailAddress,
  goToUserAccountSettings,
  tid,
  typeEmailPassword,
  typeLightwalletRecoveryPhrase,
} from "../utils";
import { cyPromise } from "../utils/cyPromise";
import { generateRandomSeedAndAddress } from "../utils/generateRandomSeedAndAddress";

describe("Wallet recover", function(): void {
  this.retries(2);
  it("should recover wallet from saved phrases", () => {
    cyPromise(() => generateRandomSeedAndAddress("m/44'/60'/0'")).then(
      ({ seed: words, address: expectedGeneratedAddress }) => {
        const email = generateRandomEmailAddress();

        cy.visit(`${recoverRoutes.seed}`);

        typeLightwalletRecoveryPhrase(words);

        cy.get(tid("wallet-selector-register-email")).type(email);
        cy.get(tid("wallet-selector-register-password")).type("strongpassword");
        cy.get(tid("wallet-selector-register-confirm-password")).type("strongpassword{enter}");

        cy.get(tid("recovery-success-btn-go-dashboard")).awaitedClick();

        assertWaitForLatestEmailSentWithSalt(email);

        cy.contains(tid("my-neu-widget-neumark-balance.large-value"), "0 NEU");

        cy.contains(tid("my-wallet-widget-eur-token.large-value"), "0 nEUR");
        cy.contains(tid("my-wallet-widget-eur-token.value"), "0 EUR");

        acceptTOS();

        goToUserAccountSettings();
        cy.get(tid("account-address.your.ether-address.from-div")).then(value => {
          expect(value[0].innerText.toLowerCase()).to.equal(expectedGeneratedAddress);
        });
      },
    );
  });

  it("should return an error when recovering seed and using an already verified email", () => {
    createAndLoginNewUser({
      type: "investor",
      kyc: "individual",
    }).then(() => {
      cy.window().then(window => {
        // TODO: move into a seperate util method
        const metaData = JSON.parse(window.localStorage.getItem("NF_WALLET_METADATA") as string);
        cy.clearLocalStorage().then(() => {
          cy.visit(`${recoverRoutes.seed}`);
          cyPromise(() => generateRandomSeedAndAddress("m/44'/60'/0'")).then(({ seed }) => {
            typeLightwalletRecoveryPhrase(seed);
            typeEmailPassword(metaData.email, "randomPassword");

            assertErrorModal();
          });
        });
      });
    });
  });

  it("should recover user with same email if its the same user", function(): void {
    cyPromise(() => generateRandomSeedAndAddress("m/44'/60'/0'")).then(({ seed }) => {
      createAndLoginNewUser({
        type: "investor",
        kyc: "individual",
        seed: seed.join(" "),
      }).then(() => {
        const email = generateRandomEmailAddress();
        const password = "strongpassword";
        cy.clearLocalStorage();
        cy.visit(`${recoverRoutes.seed}`);

        typeLightwalletRecoveryPhrase(seed);
        typeEmailPassword(email, password);
        cy.wait(4000);
        cy.get(tid("recovery-success-btn-go-dashboard")).awaitedClick();

        assertDashboard();
      });
    });
  });

  it.skip("should recover existing user with verified email from saved phrases and change email", function(): void {
    cyPromise(() => generateRandomSeedAndAddress("m/44'/60'/0'")).then(({ seed }) => {
      createAndLoginNewUser({
        type: "investor",
        kyc: "individual",
        seed: seed.join(" "),
      }).then(() => {
        {
          const email = generateRandomEmailAddress();
          const password = "strongpassword";

          cy.clearLocalStorage().then(() => {
            cy.visit(recoverRoutes.seed);

            typeLightwalletRecoveryPhrase(seed);

            typeEmailPassword(email, password);
            assertWaitForLatestEmailSentWithSalt(email);
            cy.get(tid("recovery-success-btn-go-dashboard")).awaitedClick();
            cy.visit("/");
            assertDashboard();
          });
        }
      });
    });
  });
});
