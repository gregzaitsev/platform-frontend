export interface IWindowData {
  payoutRequiredAmount?: string;
  disableNotAcceptingEtherCheck?: boolean;
  forceLowGas?: boolean;
}

export type IWindowWithData = IWindowData & Window;
