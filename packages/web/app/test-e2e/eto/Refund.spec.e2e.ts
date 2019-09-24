import BigNumber from "bignumber.js";

import { etoPublicViewByIdLinkLegacy } from "../../components/appRouteUtils";
import {
  confirmAccessModal,
  etoFixtureAddressByName,
  getLockedWalletEthAmount,
  parseAmount,
  tid,
} from "../utils";
import { loginFixtureAccount } from "../utils/userHelpers";

describe("Refund", () => {
  it("Refund from ETO Page", () => {
    const ETO_ID = etoFixtureAddressByName("ETOInRefundState");

    loginFixtureAccount("INV_ICBM_ETH_M_HAS_KYC_DUP", {
      kyc: "business",
      clearPendingTransactions: true,
    }).then(() => {
      getLockedWalletEthAmount().as("currentAmount");

      cy.visit(etoPublicViewByIdLinkLegacy(ETO_ID));

      cy.get(tid("eto-overview-claim-your-refund")).click();

      // assert flow modal
      cy.get(tid("modals.tx-sender.user-refund-flow")).should("exist");

      cy.get(tid("modals.tx-sender.user-refund-flow.amount.eth"))
        .then($element => parseAmount($element.text()))
        .as("refundAmount");

      cy.get(tid("modals.tx-sender.user-refund-flow.summary.accept")).click();

      confirmAccessModal();

      cy.get(tid("modals.shared.tx-success.modal"));

      cy.get<BigNumber>("@refundAmount").then(amount => {
        cy.get<BigNumber>("@currentAmount").then(balanceBefore => {
          getLockedWalletEthAmount().then(balanceAfter => {
            // balance after refund should be increased by the refund amount
            // there can be rounding issue so we assert balance with small delta
            expect(balanceAfter.minus(balanceBefore.plus(amount))).to.be.bignumber.lessThan(0.01);
          });
        });
      });

      cy.visit(etoPublicViewByIdLinkLegacy(ETO_ID));

      cy.get(tid("eto-overview-refund-claimed")).should("exist");
    });
  });
});
