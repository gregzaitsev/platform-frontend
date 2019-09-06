import { TMessage } from "../../components/translatedMessages/utils";
import { AppReducer } from "../../store";
import { DeepReadonly } from "../../types";

export interface IWalletSelectorState {
  isMessageSigning: boolean;
  messageSigningError?: DeepReadonly<TMessage>;
}

const walletSelectorInitialState: IWalletSelectorState = {
  isMessageSigning: false,
};

export const walletSelectorReducer: AppReducer<IWalletSelectorState> = (
  state = walletSelectorInitialState,
  action,
): IWalletSelectorState => {
  switch (action.type) {
    case "WALLET_SELECTOR_MESSAGE_SIGNING":
      return {
        ...state,
        isMessageSigning: true,
        messageSigningError: undefined,
      };
    case "WALLET_SELECTOR_MESSAGE_SIGNING_ERROR":
      return {
        ...state,
        messageSigningError: action.payload.errorMessage,
      };
    case "WALLET_SELECTOR_RESET":
      return {
        ...state,
        isMessageSigning: false,
        messageSigningError: undefined,
      };
  }

  return state;
};
