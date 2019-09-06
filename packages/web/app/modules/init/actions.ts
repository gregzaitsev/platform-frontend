import { createActionFactory } from "@neufund/shared";

import { EInitType } from "./reducer";

export const initActions = {
  appStart: createActionFactory("INIT_START" ),
  done: createActionFactory("INIT_DONE", (initType: EInitType) => ({ initType })),
  error: createActionFactory("INIT_ERROR", (initType: EInitType, errorMsg?: string) => ({
    initType,
    errorMsg,
  })),
  contractsStart:createActionFactory("INIT_CONTRACTS_START"),
  contractsDone: createActionFactory("INIT_CONTRACTS_DONE", ),
  contractsError: createActionFactory("INIT_CONTRACTS_ERROR", (errorMsg?: string) => ({
    errorMsg,
  })),
};
