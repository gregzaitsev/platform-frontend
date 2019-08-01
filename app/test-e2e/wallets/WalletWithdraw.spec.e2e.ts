import BigNumber from "bignumber.js";
import Web3Accounts from "web3-eth-accounts";

import { accountFixtureByName, confirmAccessModal, goToDashboard, parseAmount } from "../utils";
import { getBalanceRpc, getTransactionByHashRpc } from "../utils/ethRpcUtils";
import { fillForm } from "../utils/forms";
import { accountFixtureAddress } from "../utils/index";
import { goWalletWithParams } from "../utils/navigation";
import { tid } from "../utils/selectors";
import { DEFAULT_PASSWORD, loginFixtureAccount } from "../utils/userHelpers";

export const SimpleExchangeContract: any = require("../../../git_modules/platform-contracts-artifacts/localhost/contracts/SimpleExchange.json");
export const EuroTokenContract: any = require("../../../git_modules/platform-contracts-artifacts/localhost/contracts/EuroToken.json");

const Q18 = new BigNumber(10).pow(18);

const assertWithdrawButtonIsDisabled = () =>
  cy
    .get(tid("modals.tx-sender.withdraw-flow.withdraw-component.send-transaction-button"))
    .should("be.disabled");

const typeWrongAddress = () => {
  assertWithdrawButtonIsDisabled();
  cy.get(tid("modals.tx-sender.withdraw-flow.withdraw-component.to-address")).type("0xCBD");
  assertWithdrawButtonIsDisabled();
  cy.get(tid("modals.tx-sender.withdraw-flow.withdraw-component.to-address")).clear();
};

const typeWrongValue = () => {
  assertWithdrawButtonIsDisabled();

  cy.get(tid("modals.tx-sender.withdraw-flow.withdraw-component.value")).type("-1");
  assertWithdrawButtonIsDisabled();
  cy.get(tid("modals.tx-sender.withdraw-flow.withdraw-component.value")).clear();

  cy.get(tid("modals.tx-sender.withdraw-flow.withdraw-component.value")).type("df7");
  assertWithdrawButtonIsDisabled();
  cy.get(tid("modals.tx-sender.withdraw-flow.withdraw-component.value")).clear();
};

export const checkTransactionWithRPCNode = (
  expectedTransaction: {
    expectedFrom: string;
    expectedInput: string;
    expectedGasLimit: string;
    writtenValue: string;
    expectedTo: string;
  },
  txHash: string,
) => {
  getTransactionByHashRpc(txHash).then(data => {
    const { from, gas, input, hash, value } = data.body.result;
    const {
      expectedFrom,
      expectedInput,
      expectedGasLimit,
      writtenValue,
      expectedTo,
    } = expectedTransaction;

    const ethValue = new BigNumber(value).toString();

    expect(from).to.equal(expectedFrom);
    expect(hash).to.equal(txHash);
    expect(input).to.equal(expectedInput);
    expect(gas).to.equal(expectedGasLimit);
    expect(ethValue).to.equal(Q18.mul(writtenValue).toString());

    // TODO: Connect artifacts with tests to get deterministic addresses
    // expect(etherTokenAddress).to.equal(to);

    getBalanceRpc(expectedTo).then(balance => {
      const receivedEtherValue = new BigNumber(balance.body.result).toString();
      expect(receivedEtherValue).to.equal(Q18.mul(writtenValue).toString());
    });
  });
};

const fillWithdrawForm = (testAddress: string, testValue: number) => {
  cy.get(tid("account-address.your.ether-address.from-div"))
    .then(address => address.text())
    .as("accountAddress");
  cy.get(tid("wallet.eth.withdraw.button")).awaitedClick();
  /*Test Address field validation*/
  typeWrongAddress();
  cy.get(tid("modals.tx-sender.withdraw-flow.withdraw-component.to-address"))
    .type(testAddress)
    .blur();
  /*Test Address field validation*/
  typeWrongValue();

  cy.get(tid("modals.tx-sender.withdraw-flow.withdraw-component.value"))
    .type(testValue.toString())
    .blur();
};

const assertWithdrawFlow = (testAddress: string, testValue: number) => {
  const expectedInput = `0x64663ea6000000000000000000000000${testAddress
    .slice(2)
    .toLowerCase()}0000000000000000000000000000000000000000000000004563918244f40000`;

  getBalanceRpc(testAddress)
    .then(v => new BigNumber(v.body.result))
    .as("previousBalance");

  cy.get(tid(`etherscan-link.${testAddress}`)).should("exist");
  cy.get(tid("modals.tx-sender.withdraw-flow.summary.value.large-value"))
    .then(e => parseAmount(e.text()).toNumber())
    .should("eq", testValue);

  cy.get(tid("modals.tx-sender.withdraw-flow.summary.cost.large-value")).contains(/0\.\d{4}/);

  cy.get(tid("modals.tx-sender.withdraw-flow.summary.accept")).awaitedClick();

  confirmAccessModal(DEFAULT_PASSWORD);

  cy.get(tid("modals.shared.signing-message.modal")).should("exist");
  cy.get(tid("modals.tx-sender.withdraw-flow.success")).should("exist");

  cy.get(tid("modals.tx-sender.withdraw-flow.tx-hash")).then(txHashObject => {
    const txHash = txHashObject.attr("data-test-hash")!;
    getTransactionByHashRpc(txHash).then(data => {
      cy.get<string>("@accountAddress").then(accountAddress => {
        const { from, input, hash, value } = data.body.result;

        const ethValue = new BigNumber(value).toString();

        expect(from).to.equal(accountAddress.toLowerCase());
        expect(txHash).to.equal(hash);
        expect(input).to.equal(expectedInput);
        // do not check expected gas limit - any change in the solidity implementation will make test fail
        // expect(gas).to.equal(expectedGasLimit);
        expect(ethValue).to.equal(Q18.mul(0).toString());

        // TODO: Connect artifacts with tests to get deterministic addresses
        // expect(etherTokenAddress).to.equal(to);

        cy.get<BigNumber>("@previousBalance").then(previousBalance => {
          getBalanceRpc(testAddress).then(balance => {
            const currentBalance = new BigNumber(balance.body.result);
            const receivedValue = currentBalance.sub(previousBalance);
            expect(receivedValue.toString()).to.equal(Q18.mul(testValue).toString());
          });
        });
      });
    });
  });
};

describe("Wallet Withdraw", () => {
  it("should ask if you want to not leave account without gas reserves", () => {
    loginFixtureAccount("INV_EUR_ICBM_HAS_KYC", {
      signTosAgreement: true,
      onlyLogin: true,
    }).then(() => {
      goToDashboard();
      cy.get(tid("authorized-layout-wallet-button")).awaitedClick();

      const testValue = 5;
      const account = new Web3Accounts().create();
      const testAddress = account.address;

      fillWithdrawForm(testAddress, testValue);

      cy.get(tid("modals.tx-sender.withdraw-flow.withdraw-component.will-empty-wallet")).should(
        "not.exist",
      );

      // Should show warning for whole possible balance used
      cy.get(tid("modals.tx-sender.withdraw-flow.withdraw-component.whole-balance")).click();

      cy.get(tid("modals.tx-sender.withdraw-flow.withdraw-component.value"))
        .invoke("val")
        .as("maxValue");

      cy.get(tid("modals.tx-sender.withdraw-flow.withdraw-component.will-empty-wallet")).should(
        "exist",
      );

      cy.get(tid("modals.tx-sender.withdraw-flow.withdraw-component.value")).clear();

      // Should show warning for slightly lower value than whole balance
      cy.get<string>("@maxValue").then(v => {
        const value = parseAmount(v).sub(0.001); // Subtract small value from maximum balance
        cy.log(value.toString());
        cy.get(tid("modals.tx-sender.withdraw-flow.withdraw-component.value")).type(
          value.toString(),
        );
      });

      cy.get(tid("modals.tx-sender.withdraw-flow.withdraw-component.will-empty-wallet")).should(
        "exist",
      );

      cy.get(
        tid("modals.tx-sender.withdraw-flow.withdraw-component.send-transaction-button"),
      ).should("be.disabled");
    });
  });

  it("it should not break when address is not provided first", () => {
    loginFixtureAccount("INV_EUR_ICBM_HAS_KYC", {
      signTosAgreement: true,
      onlyLogin: true,
    }).then(() => {
      goToDashboard();

      const testValue = 5;
      const account = new Web3Accounts().create();
      const testAddress = account.address;

      cy.get(tid("authorized-layout-wallet-button")).awaitedClick();
      cy.get(tid("authorized-layout-wallet-button")).awaitedClick();

      cy.get(tid("wallet.eth.withdraw.button")).awaitedClick();

      cy.get(tid("modals.tx-sender.withdraw-flow.withdraw-component.value")).type(
        testValue.toString(),
      );

      cy.get(tid("modals.tx-sender.withdraw-flow.withdraw-component.to-address")).type(testAddress);

      fillForm(
        {
          allowNewAddress: {
            type: "checkbox",
            values: { false: true },
          },
        },
        { submit: false },
      );

      cy.get(
        tid("modals.tx-sender.withdraw-flow.withdraw-component.send-transaction-button"),
      ).should("be.enabled");
    });
  });

  it("should not allow to withdraw to smart contract not accepting ether", () => {
    loginFixtureAccount("INV_EUR_ICBM_HAS_KYC", {
      signTosAgreement: true,
      onlyLogin: true,
    }).then(() => {
      goToDashboard();

      const testAddress = EuroTokenContract.networks["17"].address;

      const testValue = 5;

      cy.get(tid("authorized-layout-wallet-button")).awaitedClick();
      fillWithdrawForm(testAddress, testValue);

      cy.get(tid("modals.tx-sender.withdraw-flow.withdraw-component.not-accepting-ether")).should(
        "exist",
      );
      cy.get(
        tid("modals.tx-sender.withdraw-flow.withdraw-component.send-transaction-button"),
      ).should("be.disabled");
    });
  });

  it("should not allow to withdraw to smart contract not accepting ether when user has no ETH-T", () => {
    loginFixtureAccount("INV_EUR_ICBM_HAS_KYC_SEED", {
      signTosAgreement: true,
      onlyLogin: true,
    }).then(() => {
      goToDashboard();
      const testAddress = EuroTokenContract.networks["17"].address;

      const testValue = 5;

      cy.get(tid("authorized-layout-wallet-button")).awaitedClick();

      cy.get(tid("wallet.eth.withdraw.button")).awaitedClick();
      cy.get(tid("modals.tx-sender.withdraw-flow.withdraw-component.to-address")).type(testAddress);

      cy.get(tid("modals.tx-sender.withdraw-flow.withdraw-component.value")).type(
        testValue.toString(),
      );

      cy.get(tid("modals.tx-sender.withdraw-flow.withdraw-component.not-accepting-ether")).should(
        "exist",
      );
      cy.get(
        tid("modals.tx-sender.withdraw-flow.withdraw-component.send-transaction-button"),
      ).should("be.disabled");
    });
  });

  it("should withdraw to new wallet", () => {
    loginFixtureAccount("INV_EUR_ICBM_HAS_KYC", {
      signTosAgreement: true,
      onlyLogin: true,
    }).then(() => {
      goToDashboard();

      const testValue = 5;
      const account = new Web3Accounts().create();
      const testAddress = account.address;

      cy.get(tid("authorized-layout-wallet-button")).awaitedClick();
      fillWithdrawForm(testAddress, testValue);

      /* Newly created wallet should not have any transactions so we have to accept warnings */
      cy.get(
        tid("modals.tx-sender.withdraw-flow.withdraw-component.send-transaction-button"),
      ).should("be.disabled");
      cy.get(tid("modals.tx-sender.withdraw-flow.withdraw-component.new-address")).should("exist");

      fillForm(
        {
          allowNewAddress: {
            type: "checkbox",
            values: { false: true },
          },
        },
        { submit: false },
      );

      cy.get(tid("modals.tx-sender.withdraw-flow.withdraw-component.send-transaction-button"))
        .should("be.enabled")
        .click();

      assertWithdrawFlow(testAddress, testValue);
    });
  });

  it("should show warning when withdraw to not used wallet", () => {
    loginFixtureAccount("INV_EUR_ICBM_HAS_KYC", {
      signTosAgreement: true,
      onlyLogin: true,
    }).then(() => {
      goToDashboard();

      const testValue = 5;
      const account = new Web3Accounts().create();
      const testAddress = account.address;

      cy.get(tid("authorized-layout-wallet-button")).awaitedClick();
      cy.get(tid("authorized-layout-wallet-button")).awaitedClick();
      fillWithdrawForm(testAddress, testValue);

      /* Newly created wallet should not have any transactions so we have to accept warnings */
      cy.get(
        tid("modals.tx-sender.withdraw-flow.withdraw-component.send-transaction-button"),
      ).should("be.disabled");
      cy.get(tid("modals.tx-sender.withdraw-flow.withdraw-component.new-address")).should("exist");

      fillForm(
        {
          allowNewAddress: {
            type: "checkbox",
            values: { false: true },
          },
        },
        { submit: false },
      );

      cy.get(tid("modals.tx-sender.withdraw-flow.withdraw-component.send-transaction-button"))
        .should("be.enabled")
        .click();

      assertWithdrawFlow(testAddress, testValue);

      goToDashboard();
      cy.get(tid("authorized-layout-wallet-button")).awaitedClick();
      fillWithdrawForm(testAddress, testValue);
      cy.get(
        tid("modals.tx-sender.withdraw-flow.withdraw-component.new-address-with-balance"),
      ).should("exist");
    });
  });

  it("should show message when withdraw to verified platform address", () => {
    loginFixtureAccount("INV_EUR_ICBM_HAS_KYC", {
      signTosAgreement: true,
      onlyLogin: true,
    }).then(() => {
      goToDashboard();

      const testValue = 5;
      const testAddress = accountFixtureAddress("INV_EUR_ICBM_HAS_KYC_SEED");

      cy.get(tid("authorized-layout-wallet-button")).awaitedClick();
      cy.get(tid("authorized-layout-wallet-button")).awaitedClick();
      fillWithdrawForm(testAddress, testValue);

      cy.get(tid("modals.tx-sender.withdraw-flow.withdraw-component.new-address")).should(
        "not.exist",
      );
      cy.get(tid("modals.tx-sender.withdraw-flow.withdraw-component.verified-user")).should(
        "exist",
      );

      cy.get(tid("modals.tx-sender.withdraw-flow.withdraw-component.send-transaction-button"))
        .should("be.enabled")
        .click();

      assertWithdrawFlow(testAddress, testValue);
    });
  });

  it("should allow to withdraw to smart contract accepting ether", () => {
    loginFixtureAccount("INV_EUR_ICBM_HAS_KYC", {
      signTosAgreement: true,
      onlyLogin: true,
    }).then(() => {
      goToDashboard();

      const testAddress = SimpleExchangeContract.networks["17"].address;

      const testValue = 5;

      cy.get(tid("authorized-layout-wallet-button")).awaitedClick();
      fillWithdrawForm(testAddress, testValue);

      /* Address is smart contract so we need to accept warnings */
      cy.get(tid("modals.tx-sender.withdraw-flow.withdraw-component.smart-contract")).should(
        "exist",
      );
      fillForm(
        {
          allowSmartContract: {
            type: "checkbox",
            values: { false: true },
          },
        },
        { submit: false },
      );
      cy.get(tid("modals.tx-sender.withdraw-flow.withdraw-component.send-transaction-button"))
        .should("be.enabled")
        .click();

      /*Test flow*/

      assertWithdrawFlow(testAddress, testValue);
    });
  });

  it("should allow to withdraw to fixture without warnings", () => {
    loginFixtureAccount("INV_EUR_ICBM_HAS_KYC", {
      signTosAgreement: true,
      onlyLogin: true,
    }).then(() => {
      goToDashboard();

      const testAddress = accountFixtureByName("INV_ICBM_ETH_M_HAS_KYC_DUP").definition.address;

      const testValue = 5;

      cy.get(tid("authorized-layout-wallet-button")).awaitedClick();
      fillWithdrawForm(testAddress, testValue);

      /* Address has transaction so accept should not exist */
      cy.get(tid("modals.tx-sender.withdraw-flow.withdraw-component.accept-warnings")).should(
        "not.exist",
      );

      cy.get(tid("modals.tx-sender.withdraw-flow.withdraw-component.send-transaction-button"))
        .should("be.enabled")
        .click();

      assertWithdrawFlow(testAddress, testValue);
    });
  });

  it("should show transaction error with cost for mined transaction", () => {
    loginFixtureAccount("INV_EUR_ICBM_HAS_KYC", {
      signTosAgreement: true,
      onlyLogin: true,
    }).then(() => {
      goToDashboard();

      const testAddress = EuroTokenContract.networks["17"].address;

      const testValue = 5;

      goWalletWithParams({
        disableNotAcceptingEtherCheck: true,
      });
      fillWithdrawForm(testAddress, testValue);

      fillForm(
        {
          allowSmartContract: {
            type: "checkbox",
            values: { false: true },
          },
        },
        { submit: false },
      );
      cy.get(tid("modals.tx-sender.withdraw-flow.withdraw-component.send-transaction-button"))
        .should("be.enabled")
        .click();

      cy.get(tid("modals.tx-sender.withdraw-flow.summary.accept")).awaitedClick();

      confirmAccessModal(DEFAULT_PASSWORD);

      cy.get(tid("modals.shared.signing-message.modal")).should("exist");
      cy.get(tid("modals.tx-sender.withdraw-flow.error")).should("exist");

      // For mined transaction cost should exist
      cy.get(tid("modals.tx-sender.withdraw-flow.summary.cost.large-value")).contains(/0\.\d{4}/);
    });
  });

  it("should show transaction error with no cost for not mined transaction", () => {
    loginFixtureAccount("INV_EUR_ICBM_HAS_KYC", {
      signTosAgreement: true,
      onlyLogin: true,
    }).then(() => {
      goToDashboard();

      const testValue = 5;

      const account = new Web3Accounts().create();
      const testAddress = account.address;

      goWalletWithParams({
        forceLowGas: true,
      });
      fillWithdrawForm(testAddress, testValue);

      fillForm(
        {
          allowNewAddress: {
            type: "checkbox",
            values: { false: true },
          },
        },
        { submit: false },
      );
      cy.get(tid("modals.tx-sender.withdraw-flow.withdraw-component.send-transaction-button"))
        .should("be.enabled")
        .click();

      cy.get(tid("modals.tx-sender.withdraw-flow.summary.accept")).awaitedClick();

      confirmAccessModal(DEFAULT_PASSWORD);

      cy.get(tid("modals.shared.signing-message.modal")).should("exist");
      cy.get(tid("modals.tx-sender.withdraw-flow.error")).should("exist");

      // For mined transaction cost should exist
      cy.get(tid("modals.tx-sender.withdraw-flow.summary.cost.large-value")).should("not.exist");
    });
  });

  it("Should allow to withdraw all for specific available amount", () => {
    // Use INV_EUR_ICBM_HAS_KYC which is confirmed case of broken calculation
    loginFixtureAccount("INV_EUR_ICBM_HAS_KYC", {
      signTosAgreement: true,
      onlyLogin: true,
    }).then(() => {
      goToDashboard();

      const testValue = 5;
      const testAddress = accountFixtureAddress("ISSUER_BLANK_QA_HAS_KYC");

      cy.get(tid("authorized-layout-wallet-button")).awaitedClick();
      cy.get(tid("authorized-layout-wallet-button")).awaitedClick();
      fillWithdrawForm(testAddress, testValue);

      cy.get(tid("modals.tx-sender.withdraw-flow.withdraw-component.new-address")).should(
        "not.exist",
      );
      cy.get(tid("modals.tx-sender.withdraw-flow.withdraw-component.verified-user")).should(
        "exist",
      );

      cy.get(tid("modals.tx-sender.withdraw-flow.withdraw-component.whole-balance")).click();

      fillForm(
        {
          withdrawAll: {
            type: "checkbox",
            values: { false: true },
          },
        },
        { submit: false },
      );

      cy.get(
        tid("modals.tx-sender.withdraw-flow.withdraw-component.send-transaction-button"),
      ).should("be.enabled");
    });
  });
});
