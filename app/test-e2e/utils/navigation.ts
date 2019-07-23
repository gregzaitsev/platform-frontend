import { IWindowWithData } from "../../../test/helperTypes";
import { assertIssuerEtoView } from "../eto-view/EtoViewUtils";
import {
  assertDashboard,
  assertEtoDashboard,
  assertEtoDocuments, assertNomineeDashboard,
  assertPortfolio,
  assertProfile,
  assertWallet,
} from "./assertions";

export const goToDashboard = (assert = true) => {
  cy.visit("/dashboard");

  if (assert) {
    assertDashboard();
  }
};

export const goToDashboardWithRequiredPayoutAmountSet = (
  assert = true,
  requiredPayoutAmount?: string,
) => {
  cy.visit("/dashboard", {
    onBeforeLoad(win: IWindowWithData): void {
      win.payoutRequiredAmount = requiredPayoutAmount;
    },
  });

  if (assert) {
    assertDashboard();
  }
};

export const goToEtoDashboard = () => {
  cy.visit("/dashboard");
  assertEtoDashboard();
};

export const goToEtoPreview = () => {
  cy.visit("/eto/view");
  assertIssuerEtoView();
};

export const goToNomineeDashboard = () => {
  cy.visit("/dashboard");
  assertNomineeDashboard();
};

export const goToProfile = () => {
  cy.visit("/profile");
  assertProfile();
};

export const goToPortfolio = () => {
  cy.visit("/portfolio");
  assertPortfolio();
};

export const goToWallet = () => {
  cy.visit("/wallet");
  assertWallet();
};

export const goToEtoDocuments = () => {
  cy.visit("/documents");
  assertEtoDocuments();
};

export const goToPortfolioWithRequiredPayoutAmountSet = (requiredPayoutAmount?: string) => {
  cy.visit("/portfolio", {
    onBeforeLoad(win: IWindowWithData): void {
      win.payoutRequiredAmount = requiredPayoutAmount;
    },
  });
  assertPortfolio();
};
