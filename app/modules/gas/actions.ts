import { GasModelShape } from "../../lib/api/gas/GasApi";
import { createActionFactory } from "../actionsUtils";

export const gasActions = {
  gasApiEnsureLoading: createActionFactory("GAS_API_ENSURE_LOADING"),
  gasApiStartLoading: createActionFactory("GAS_API_START_LOADING"),
  gasApiLoaded: createActionFactory(
    "GAS_API_LOADED",
    (payload: { data?: GasModelShape; error?: string }) => payload,
  ),
};
