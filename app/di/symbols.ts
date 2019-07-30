import { mapValues } from "lodash";

export const symbols = makeDebugSymbols({
  // configs
  config: Symbol(),
  ethereumNetworkConfig: Symbol(),
  backendRootConfig: Symbol(),

  // apis
  apiImmutableStorage: Symbol(),
  jsonHttpClient: Symbol(),
  binaryHttpClient: Symbol(),
  authorizedJsonHttpClient: Symbol(),
  authorizedBinaryHttpClient: Symbol(),
  signatureAuthApi: Symbol(),
  vaultApi: Symbol(),
  analyticsApi: Symbol(),
  usersApi: Symbol(),
  apiKycService: Symbol(),
  apiEtoService: Symbol(),
  apiEtoPledgeService: Symbol(),
  apiEtoProductService: Symbol(),
  apiEtoFileService: Symbol(),
  apiEtoNomineeService: Symbol(),
  fileStorageService: Symbol(),
  gasApi: Symbol(),

  // contracts
  contractsService: Symbol(),

  // wallets
  lightWalletUtil: Symbol(),
  lightWalletConnector: Symbol(),
  ledgerWalletConnector: Symbol(),
  browserWalletConnector: Symbol(),
  web3Manager: Symbol(),
  web3Factory: Symbol(),
  web3BatchFactory: Symbol(),

  // storages
  walletStorage: Symbol(),
  userStorage: Symbol(),
  jwtStorage: Symbol(),

  // utils
  notificationCenter: Symbol(),
  logger: Symbol(),
  storage: Symbol(),
  asyncIntervalSchedulerFactory: Symbol(),
  detectBrowser: Symbol(),

  intlWrapper: Symbol(),

  // external modules
  cryptoRandomString: Symbol(),
});

/**
 * Adds automatically symbols name values which makes debugging easier
 */
export function makeDebugSymbols<T>(symbols: T): T {
  return mapValues(symbols as any, (_val, key) => Symbol.for(key)) as any;
}
