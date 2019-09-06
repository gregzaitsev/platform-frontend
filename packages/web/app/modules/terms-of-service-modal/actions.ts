import { createAction, createSimpleAction } from "../actionsUtils";

export const tosModalActions = {
  setCurrentAgreementHash: (currentAgreementHash: string) =>
    createAction("SET_CURRENT_AGREEMENT_HASH", { currentAgreementHash }),
  acceptCurrentAgreement: () => createSimpleAction("ACCEPT_CURRENT_AGREEMENT"),
  downloadCurrentAgreement: () => createSimpleAction("DOWNLOAD_CURRENT_AGREEMENT"),
};
