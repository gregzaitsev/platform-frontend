import { closeModal, confirmAccessModal, goToWallet } from "../utils";
import { fillForm } from "../utils/forms";
import { tid } from "../utils/selectors";

export const doWithdraw = (
  address: string,
  amount: string,
  { closeWhen }: { closeWhen: "pending" | "success" | "error" | "never" },
) => {
  goToWallet();

  cy.get(tid("wallet.eth.withdraw.button")).click();

  cy.get(tid("modals.tx-sender.withdraw-flow.withdraw-component.to-address")).type(address);
  cy.get(tid("modals.tx-sender.withdraw-flow.withdraw-component.value")).type(amount);

  fillForm(
    {
      acceptWarnings: {
        type: "checkbox",
        values: { false: true },
      },
    },
    { submit: false },
  );

  cy.get(tid("modals.tx-sender.withdraw-flow.withdraw-component.send-transaction-button"))
    .should("be.enabled")
    .click();

  cy.get(tid("modals.tx-sender.withdraw-flow.summary.accept")).click();

  confirmAccessModal();

  switch (closeWhen) {
    case "pending":
      cy.get(tid("modals.shared.tx-pending.modal")).should("exist");

      closeModal();
      break;
    case "success":
      cy.get(tid("modals.tx-sender.withdraw-flow.success")).should("exist");

      closeModal();
      break;
    case "error":
      cy.get(tid("modals.shared.tx-error.modal")).should("exist");

      closeModal();

      break;
    case "never":
      // wait for transaction to finish
      cy.get(
        `${tid("modals.tx-sender.withdraw-flow.success")}, ${tid("modals.shared.tx-error.modal")}`,
      ).should("exist");

      break;
  }
};

export const assertPendingWithdrawModal = (address: string, amount: string) => {
  // should show pending modal
  cy.get(tid("modals.shared.tx-pending.modal")).should("exist");

  // should propagate correct data to modal
  cy.get(tid("modals.tx-sender.withdraw-flow.summary.to")).contains(address);
  cy.get(tid("modals.tx-sender.withdraw-flow.summary.value.large-value")).contains(amount);
  cy.get(tid("modals.tx-sender.withdraw-flow.summary.cost.large-value")).contains(/0\.\d{4}/);
};

export const assertSuccessWithdrawModal = (address: string, amount: string) => {
  // when mined should show success modal
  cy.get(tid("modals.tx-sender.withdraw-flow.success")).should("exist");

  // should propagate correct data to modal
  cy.get(tid("modals.tx-sender.withdraw-flow.summary.to")).contains(address);
  cy.get(tid("modals.tx-sender.withdraw-flow.summary.value.large-value")).contains(amount);
  cy.get(tid("modals.tx-sender.withdraw-flow.summary.cost.large-value")).contains(/0\.\d{4}/);
  cy.get(tid("timestamp-row.timestamp")).should("exist");
};
