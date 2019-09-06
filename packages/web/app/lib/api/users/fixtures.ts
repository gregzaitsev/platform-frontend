import { TWalletMetadata } from "../../../modules/web3/types";
import { EUserType } from "./interfaces";

export const getDummyUser = (walletMetadata: TWalletMetadata) => ({
  userId: "user-id",
  type: EUserType.INVESTOR,
  walletType: walletMetadata.walletType,
  walletSubtype: walletMetadata.walletSubType,
});
