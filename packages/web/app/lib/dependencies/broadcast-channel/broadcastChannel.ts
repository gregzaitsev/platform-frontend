import BroadcastChannel from "broadcast-channel";

export const createNewBroadcastChannel = <T>(key: string): BroadcastChannel<T> =>
  new BroadcastChannel(key);

export type BroadcastChannel<T> = BroadcastChannel<T>;
