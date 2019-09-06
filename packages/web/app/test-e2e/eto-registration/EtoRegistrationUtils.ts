import { isFunction } from "lodash/fp";

import { toCamelCase } from "../../utils/transformObjectKeys";
import { withParams } from "../../utils/withParams";
import { acceptWallet } from "../utils";
import { assertEtoDashboard } from "../utils/assertions";
import { cyPromise } from "../utils/cyPromise";
import { fillForm, TFormFixture } from "../utils/forms";
import { goToEtoDashboard } from "../utils/navigation";
import { tid } from "../utils/selectors";
import { createUser, makeAuthenticatedCall } from "../utils/userHelpers";

export const submitProposal = () => {
  goToEtoDashboard();

  cy.get(tid("eto-dashboard-submit-proposal")).click();
  acceptWallet();

  cy.get(tid("eto-state-pending")).should("exist");
};

export const submitPreview = () => {
  goToEtoDashboard();

  cy.get(tid("eto-dashboard-publish-eto")).click();
  acceptWallet();
};

export const fillAndAssertFull = (section: string, sideEffect: TFormFixture | (() => void)) => {
  cy.get(`${tid(section)} button`).click();

  if (isFunction(sideEffect)) {
    sideEffect();
  } else {
    fillForm(sideEffect);
  }

  assertEtoDashboard();
  cy.get(`${tid(section)} ${tid("chart-circle.progress")}`).should("contain", "100%");
};

export const fillAndAssert = (section: string, sectionForm: TFormFixture) => {
  cy.get(`${tid(section)} button`).click();

  fillForm(sectionForm);

  assertEtoDashboard();
};

/**
 * Creates new nominee and connects it's to issuer eto
 */
export const createAndSetNominee = () =>
  cyPromise(async () => {
    const etoId = await getIssuerEtoId();

    const nominee = await createUser("nominee", undefined, "business");

    setEtoNominee(etoId, nominee.address);
  });

const ETO_ME_PATH = "/api/eto-listing/etos/me";

/**
 * Get current logged in issuer eto id
 */
export const getIssuerEtoId = (): Promise<string> =>
  makeAuthenticatedCall(ETO_ME_PATH).then(response => toCamelCase(response).etoId);

const SET_ETO_NOMINEE_PATH =
  "/api/external-services-mock/e2e-tests/etos/:etoId/nominees/:nomineeId";

/**
 * Assigns nominee to eto
 * @param etoId
 * @param nomineeId
 */
const setEtoNominee = (etoId: string, nomineeId: string) => {
  const path = withParams(SET_ETO_NOMINEE_PATH, { etoId, nomineeId });

  return cy.request("PUT", path);
};
