import { DeepReadonly, TDataTestId, TTranslatedString } from "../../types";
import { TranslatedMessageType } from "./messages";

export interface IMessageData extends TDataTestId {
  message?: TTranslatedString;
}

export type TMessage = DeepReadonly<{
  messageType: TranslatedMessageType;
  messageData?: IMessageData;
}>;

export const createMessage = (messageType: TranslatedMessageType, messageData?: any): TMessage => ({
  messageType,
  messageData,
});
