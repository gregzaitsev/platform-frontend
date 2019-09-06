import { TMessage } from "../../components/translatedMessages/utils";
import { createAction, createSimpleAction } from "../actionsUtils";
import { browserWizardActions } from "./browser-wizard/actions";
import { ledgerWizardActions } from "./ledger-wizard/actions";
import { lightWizardActions } from "./light-wizard/actions";

const actions = {
  reset: () => createSimpleAction("WALLET_SELECTOR_RESET"),
  connected: () => createSimpleAction("WALLET_SELECTOR_CONNECTED"),
  messageSigning: () => createSimpleAction("WALLET_SELECTOR_MESSAGE_SIGNING"),
  messageSigningError: (errorMessage: TMessage) =>
    createAction("WALLET_SELECTOR_MESSAGE_SIGNING_ERROR", { errorMessage }),
};

export const walletSelectorActions = {
  ...browserWizardActions,
  ...ledgerWizardActions,
  ...lightWizardActions,
  ...actions,
};
