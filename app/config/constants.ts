import BigNumber from "bignumber.js";

export const LIGHT_WALLET_PASSWORD_CACHE_TIME = 1000 * 10;
// If running in cypress wait for a short time
export const LIGHT_WALLET_PRIVATE_DATA_CACHE_TIME = process.env.IS_CYPRESS
  ? 1000 * 60
  : 1000 * 60 * 3;

/**
 * Platform Constants
 */

export const PLATFORM_UNLOCK_FEE = 0.1;
export const PLATFORM_ZERO_FEE = 0;
/**
 * We assume common digits for all currencies on our platform.
 */
export const MONEY_DECIMALS = 18;

export const DEFAULT_DECIMAL_PLACES = 4;

/**
 * Constants for permissions
 */

export enum EJwtPermissions {
  SUBMIT_KYC_PERMISSION = "submit-kyc",
  CHANGE_EMAIL_PERMISSION = "change-email",
  SUBMIT_ETO_PERMISSION = "submit-eto-listing",
  UPLOAD_IMMUTABLE_DOCUMENT = "upload-issuer-immutable-document",
  DO_BOOK_BUILDING = "do-bookbuilding",
  SIGN_TOS = "sign-tos",
}

/**
 * Useful for money related calculations
 */
export const Q18 = new BigNumber(10).pow(MONEY_DECIMALS);

/**
 * Represent zero address on Ethereum - non existing address used by ERC20 to mark minting and burning
 */
export const ETHEREUM_ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

/*
 * ETO REGISTRATION CONSTANTS
 */

export const MIN_COMPANY_SHARES = 100;
export const MIN_SHARE_NOMINAL_VALUE_EUR = 1;
export const MIN_PRE_MONEY_VALUATION_EUR = 100000;
export const MIN_EXISTING_COMPANY_SHARES = 1;
export const MIN_NEW_SHARES_TO_ISSUE = 1;
export const NEW_SHARES_TO_ISSUE_IN_WHITELIST = 1;
export const NEW_SHARES_TO_ISSUE_IN_FIXED_SLOTS = 1;
export const BOOKBUILDING_WATCHER_DELAY = 6000;
export const COMPANY_TAGS_LIMIT = 6;
export const DEFAULT_DATE_TO_WHITELIST_MIN_DURATION = 7 * 24 * 60 * 60;
export const DAY = 24 * 60 * 60;
/**
 * Constants for react components
 */
export const TOAST_COMPONENT_DELAY = 4000;

export const BROWSER_WALLET_RECONNECT_INTERVAL = 1000;

/*
 * Storage Listener Constants
 */

export const REDIRECT_CHANNEL_WATCH_DELAY = 5000;

export const IPFS_PROTOCOL = "ipfs";
