import { TWalletMetadata } from "../../modules/web3/types";
import { EUserType } from "../api/users/interfaces";

export type TStoredWalletMetadata = TWalletMetadata & { userType: EUserType };

export const STORAGE_WALLET_METADATA_KEY = "NF_WALLET_METADATA";
