import BigNumber from "bignumber.js";
import web3Accounts from "web3-eth-accounts";
import { createAndLoginNewUser, DEFAULT_PASSWORD } from "../utils/userHelpers";

import {
  assertUserInDashboard,
  numberRegExPattern,
  typeLightwalletRecoveryPhrase,
  tid,
  goToDashboard,
} from "../utils";
import { getTransactionByHashRpc, getBalanceRpc } from "../utils/ethRpcUtils";
import { recoverRoutes } from "../../components/walletSelector/walletRecover/recoverRoutes";

const Q18 = new BigNumber(10).pow(18);
const GIGA_WEI = 1000000000;
const NODE_ADDRESS = "https://localhost:9090/node";

//@see https://github.com/Neufund/platform-backend/tree/master/deploy#dev-fixtures
const WORDS = [
  "juice",
  "chest",
  "position",
  "grace",
  "weather",
  "matter",
  "turn",
  "delay",
  "space",
  "abuse",
  "winter",
  "slice",
  "tell",
  "flip",
  "use",
  "between",
  "crouch",
  "shop",
  "open",
  "leg",
  "elegant",
  "bracket",
  "lamp",
  "day",
];
const SEED = WORDS.join(" ");

describe("Wallet Withdraw", () => {
  beforeEach(() => createAndLoginNewUser({ type: "investor", seed: SEED }));

  it("should recover existing user with verified email from saved phrases and change email", () => {
    goToDashboard();

    const testValue = (5).toString();
    const expectedGasLimit = "0x186a0";
    const account = new web3Accounts().create();
    const expectedInput = `0x64663ea6000000000000000000000000${account.address
      .slice(2)
      .toLowerCase()}0000000000000000000000000000000000000000000000004563918244f40000`;

    const expectedAddress = account.address;
    const expectedInputValue = "0";

    assertUserInDashboard();
    cy.get(tid("authorized-layout-wallet-button")).click();
    cy.get(tid("account-address.your.ether-address.div")).then(accountAddress => {
      cy.get(tid("wallet-balance.ether.shared-component.withdraw.button")).click();
      cy.get(tid("modals.tx-sender.withdraw-flow.withdraw-component.to-address")).type(
        expectedAddress,
      );
      cy.get(tid("modals.tx-sender.withdraw-flow.withdraw-component.value")).type(testValue);
      cy.get(tid("modals.tx-sender.withdraw-flow.gwei-formatter-component.gas-price")).then(
        gasPrice => {
          const expectedGasPrice = gasPrice.text().match(numberRegExPattern) || ["0"];
          cy.get(
            tid("modals.tx-sender.withdraw-flow.withdraw-component.send-transaction-button"),
          ).click();

          cy.get(tid("modals.tx-sender.withdraw-flow.summery.withdrawSummery.accept")).click();
          cy.get(tid("access-light-wallet-password-input")).type(DEFAULT_PASSWORD);
          // for some reason we have to wait and click twice here, although as a user it's only once..
          cy.wait(1000);
          cy.get(tid("access-light-wallet-confirm")).click();

          cy.get(tid("modals.shared.signing-message.modal"));
          cy.get(tid("modals.tx-sender.withdraw-flow.success"));

          cy.get(tid("modals.tx-sender.withdraw-flow.tx-hash")).then(txHashObject => {
            getTransactionByHashRpc(NODE_ADDRESS, txHashObject.text()).then(data => {
              const { from, gas, gasPrice, input, hash, value } = data.body.result;

              const ethValue = new BigNumber(value).toString();
              const ethGasPrice = new BigNumber(gasPrice).div(GIGA_WEI).toString();

              expect(from).to.equal(accountAddress.text().toLowerCase());
              expect(txHashObject.text()).to.equal(hash);
              expect(ethGasPrice).to.equal(expectedGasPrice[0]);
              expect(input).to.equal(expectedInput);
              expect(gas).to.equal(expectedGasLimit);
              expect(ethValue).to.equal(expectedInputValue);

              // TODO: Connect artifacts with tests to get deterministic addresses
              // expect(etherTokenAddress).to.equal(to);

              getBalanceRpc(NODE_ADDRESS, expectedAddress).then(balance => {
                const receivedEtherValue = new BigNumber(balance.body.result).toString();
                expect(receivedEtherValue).to.equal(Q18.mul(testValue).toString());
              });
            });
          });
        },
      );
    });
  });
});
