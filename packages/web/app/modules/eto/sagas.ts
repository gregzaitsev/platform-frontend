import BigNumber from "bignumber.js";
import { LOCATION_CHANGE } from "connected-react-router";
import { camelCase } from "lodash";
import { compose, keyBy, map, omit } from "lodash/fp";
import { delay } from "redux-saga";
import { all, fork, put, race, select, take } from "redux-saga/effects";

import { hashFromIpfsLink } from "../../components/documents/utils";
import { JurisdictionDisclaimerModal } from "../../components/eto/public-view/JurisdictionDisclaimerModal";
import { EtoMessage } from "../../components/translatedMessages/messages";
import { createMessage } from "../../components/translatedMessages/utils";
import { Q18 } from "../../config/constants";
import { TGlobalDependencies } from "../../di/setupBindings";
import {
  EEtoState,
  TCompanyEtoData,
  TEtoDataWithCompany,
  TEtoSpecsData,
} from "../../lib/api/eto/EtoApi.interfaces.unsafe";
import { IEtoDocument, immutableDocumentName } from "../../lib/api/eto/EtoFileApi.interfaces";
import { EUserType } from "../../lib/api/users/interfaces";
import { ECountries } from "../../lib/api/util/countries.enum";
import { EtherToken } from "../../lib/contracts/EtherToken";
import { ETOCommitment } from "../../lib/contracts/ETOCommitment";
import { EuroToken } from "../../lib/contracts/EuroToken";
import { IAppState } from "../../store";
import { Dictionary } from "../../types";
import { divideBigNumbers, multiplyBigNumbers } from "../../utils/BigNumberUtils";
import { actions, TActionFromCreator } from "../actions";
import { selectIsUserVerified, selectUserType } from "../auth/selectors";
import { selectMyAssets } from "../investor-portfolio/selectors";
import { waitForKycStatus } from "../kyc/sagas";
import { selectClientJurisdiction } from "../kyc/selectors";
import { neuCall, neuFork, neuTakeEvery, neuTakeLatest, neuTakeUntil } from "../sagasUtils";
import { getAgreementContractAndHash } from "../tx/transactions/nominee/sign-agreement/saga";
import {
  EAgreementType,
  IAgreementContractAndHash,
} from "../tx/transactions/nominee/sign-agreement/types";
import { selectEthereumAddressWithChecksum } from "../web3/selectors";
import { etoInProgressPollingDelay, etoNormalPollingDelay } from "./constants";
import { InvalidETOStateError } from "./errors";
import {
  selectEtoById,
  selectEtoOnChainNextStateStartDate,
  selectEtoWithCompanyAndContract,
  selectFilteredEtosByRestrictedJurisdictions,
  selectIsEtoAnOffer,
} from "./selectors";
import { EEtoAgreementStatus, EETOStateOnChain, TEtoWithCompanyAndContract } from "./types";
import {
  convertToEtoTotalInvestment,
  convertToStateStartDate,
  isOnChain,
  isRestrictedEto,
} from "./utils";

function* loadEtoPreview(
  { apiEtoService, notificationCenter, logger }: TGlobalDependencies,
  action: TActionFromCreator<typeof actions.eto.loadEtoPreview>,
): any {
  const previewCode = action.payload.previewCode;

  try {
    const eto: TEtoSpecsData = yield apiEtoService.getEtoPreview(previewCode);
    const company: TCompanyEtoData = yield apiEtoService.getCompanyById(eto.companyId);

    // Load contract data if eto is already on blockchain
    if (eto.state === EEtoState.ON_CHAIN) {
      // load investor tickets
      const userType: EUserType | undefined = yield select((state: IAppState) =>
        selectUserType(state),
      );
      if (userType === EUserType.INVESTOR) {
        yield put(actions.investorEtoTicket.loadEtoInvestorTicket(eto));
      }

      yield neuCall(loadEtoContract, eto);
    }

    yield put(actions.eto.setEto({ eto, company }));
  } catch (e) {
    logger.error("Could not load eto by preview code", e);

    if (action.payload.widgetView) {
      yield put(actions.eto.setEtoWidgetError());

      return;
    }

    notificationCenter.error(createMessage(EtoMessage.COULD_NOT_LOAD_ETO_PREVIEW));
    yield put(actions.routing.goToDashboard());
  }
}

function* loadEto(
  { apiEtoService, notificationCenter, logger }: TGlobalDependencies,
  action: TActionFromCreator<typeof actions.eto.loadEto>,
): any {
  try {
    const etoId = action.payload.etoId;

    const eto: TEtoSpecsData = yield apiEtoService.getEto(etoId);

    const company: TCompanyEtoData = yield apiEtoService.getCompanyById(eto.companyId);

    // Load contract data if eto is already on blockchain
    if (eto.state === EEtoState.ON_CHAIN) {
      // load investor tickets
      const userType: EUserType | undefined = yield select((state: IAppState) =>
        selectUserType(state),
      );
      if (userType === EUserType.INVESTOR) {
        yield put(actions.investorEtoTicket.loadEtoInvestorTicket(eto));
      }

      yield neuCall(loadEtoContract, eto);
    }

    yield put(actions.eto.setEto({ eto, company }));
  } catch (e) {
    logger.error("Could not load eto by id", e);

    if (action.payload.widgetView) {
      yield put(actions.eto.setEtoWidgetError());

      return;
    }

    notificationCenter.error(createMessage(EtoMessage.COULD_NOT_LOAD_ETO));

    yield put(actions.routing.goToDashboard());
  }
}

export function* loadEtoContract(
  { contractsService, logger }: TGlobalDependencies,
  eto: TEtoDataWithCompany,
): Iterator<any> {
  if (eto.state !== EEtoState.ON_CHAIN) {
    logger.error("Invalid eto state", new InvalidETOStateError(eto.state, EEtoState.ON_CHAIN), {
      etoId: eto.etoId,
    });
    return;
  }

  try {
    const etoContract: ETOCommitment = yield contractsService.getETOCommitmentContract(eto.etoId);
    const etherTokenContract: EtherToken = contractsService.etherToken;
    const euroTokenContract: EuroToken = contractsService.euroToken;

    // fetch eto contracts state with 'all' to improve performance
    const [
      etherTokenBalance,
      euroTokenBalance,
      timedStateRaw,
      totalInvestmentRaw,
      startOfStatesRaw,
      equityTokenAddress,
      etoTermsAddress,
    ] = yield all([
      etherTokenContract.balanceOf(etoContract.address),
      euroTokenContract.balanceOf(etoContract.address),
      etoContract.timedState,
      etoContract.totalInvestment(),
      etoContract.startOfStates,
      etoContract.equityToken,
      etoContract.etoTerms,
    ]);

    yield put(
      actions.eto.setEtoDataFromContract(eto.previewCode, {
        equityTokenAddress,
        etoTermsAddress,
        timedState: timedStateRaw.toNumber(),
        totalInvestment: convertToEtoTotalInvestment(
          totalInvestmentRaw,
          euroTokenBalance,
          etherTokenBalance,
        ),
        startOfStates: convertToStateStartDate(startOfStatesRaw),
      }),
    );
  } catch (e) {
    logger.error("ETO contract data could not be loaded", e, { etoId: eto.etoId });

    // rethrow original error so it can be handled by caller saga
    throw e;
  }
}

function* watchEtoSetAction(
  _: TGlobalDependencies,
  action: TActionFromCreator<typeof actions.eto.setEto>,
): any {
  const previewCode = action.payload.eto.previewCode;

  yield neuFork(watchEto, previewCode);
}

function* watchEtosSetAction(
  _: TGlobalDependencies,
  action: TActionFromCreator<typeof actions.eto.setEtos>,
): any {
  yield all(map(eto => neuFork(watchEto, eto.previewCode), action.payload.etos));
}

const etoNextStateCount: Dictionary<number | undefined> = {};
function* calculateNextStateDelay({ logger }: TGlobalDependencies, previewCode: string): any {
  const nextStartDate: Date | undefined = yield select((state: IAppState) =>
    selectEtoOnChainNextStateStartDate(state, previewCode),
  );

  if (nextStartDate) {
    const timeToNextState = nextStartDate.getTime() - Date.now();

    if (timeToNextState > 0) {
      etoNextStateCount[previewCode] = undefined;
      // add small delay to start date to avoid fetching eto in same state
      return timeToNextState + 2000;
    }

    // if timeToNextState is negative then user and ethereum clock are not in sync
    // in that case pool eto in two time intervals of 2 and 5 seconds
    // if after than state time is still negative log warning message
    const nextStateWatchCount = etoNextStateCount[previewCode];
    if (nextStateWatchCount === undefined) {
      etoNextStateCount[previewCode] = 1;
      return 2000;
    }

    if (nextStateWatchCount === 1) {
      etoNextStateCount[previewCode] = 2;
      return 5000;
    }

    logger.warn(
      "ETO next state polling failed.",
      new Error("User and ethereum clocks are not in sync"),
      { etoPreviewCode: previewCode },
    );
  }

  return undefined;
}

export function* delayEtoRefresh(
  _: TGlobalDependencies,
  eto: TEtoWithCompanyAndContract,
): Iterator<any> {
  const strategies: Dictionary<Promise<true>> = {
    default: delay(etoNormalPollingDelay),
  };

  if (eto.state === EEtoState.ON_CHAIN) {
    if ([EETOStateOnChain.Whitelist, EETOStateOnChain.Public].includes(eto.contract!.timedState)) {
      strategies.inProgress = delay(etoInProgressPollingDelay);
    }

    const nextStateDelay: number = yield neuCall(calculateNextStateDelay, eto.previewCode);
    // Do not schedule update if it's later than normal pooling
    // otherwise it's possible to overflow max timeout limit
    // see https://stackoverflow.com/questions/3468607/why-does-settimeout-break-for-large-millisecond-delay-values
    if (nextStateDelay && nextStateDelay < etoNormalPollingDelay) {
      strategies.nextState = delay(nextStateDelay);
    }
  }

  yield race(strategies);
}

function* watchEto(_: TGlobalDependencies, previewCode: string): any {
  const eto: TEtoWithCompanyAndContract = yield select((state: IAppState) =>
    selectEtoWithCompanyAndContract(state, previewCode),
  );

  yield neuCall(delayEtoRefresh, eto);

  yield put(actions.eto.loadEtoPreview(eto.previewCode));
}

function* loadEtos({ apiEtoService, logger, notificationCenter }: TGlobalDependencies): any {
  try {
    yield waitForKycStatus();
    const etos: TEtoDataWithCompany[] = yield apiEtoService.getEtos();

    const jurisdiction: string | undefined = yield select(selectClientJurisdiction);

    yield all(
      etos
        .filter(eto => eto.state === EEtoState.ON_CHAIN)
        .map(eto => neuCall(loadEtoContract, eto)),
    );

    const filteredEtosByJurisdictionRestrictions: TEtoDataWithCompany[] = yield select(
      (state: IAppState) => selectFilteredEtosByRestrictedJurisdictions(state, etos, jurisdiction),
    );

    const order = filteredEtosByJurisdictionRestrictions.map(eto => eto.previewCode);

    const companies = compose(
      keyBy((eto: TCompanyEtoData) => eto.companyId),
      map((eto: TEtoDataWithCompany) => eto.company),
    )(filteredEtosByJurisdictionRestrictions);

    const etosByPreviewCode = compose(
      keyBy((eto: TEtoSpecsData) => eto.previewCode),
      // remove company prop from eto
      // it's saved separately for consistency with other endpoints
      map(omit("company")),
    )(filteredEtosByJurisdictionRestrictions);

    // load investor tickets
    const userType: EUserType | undefined = yield select((state: IAppState) =>
      selectUserType(state),
    );
    if (userType === EUserType.INVESTOR) {
      yield put(actions.investorEtoTicket.loadInvestorTickets(etosByPreviewCode));
    }
    yield put(actions.eto.setEtos({ etos: etosByPreviewCode, companies }));
    yield put(actions.eto.setEtosDisplayOrder(order));
  } catch (e) {
    logger.error("ETOs could not be loaded", e);

    notificationCenter.error(createMessage(EtoMessage.COULD_NOT_LOAD_ETOS));

    // set empty display order to remove loading indicator
    yield put(actions.eto.setEtosDisplayOrder([]));
  }
}

function* download(document: IEtoDocument): any {
  if (document) {
    yield put(
      actions.immutableStorage.downloadImmutableFile(
        {
          ipfsHash: document.ipfsHash,
          mimeType: document.mimeType,
          asPdf: true,
        },
        immutableDocumentName[document.documentType],
      ),
    );
  }
}

function* downloadDocument(
  _: TGlobalDependencies,
  action: TActionFromCreator<typeof actions.eto.downloadEtoDocument>,
): any {
  yield download(action.payload.document);
}

function* downloadTemplateByType(
  _: TGlobalDependencies,
  action: TActionFromCreator<typeof actions.eto.downloadEtoTemplateByType>,
): any {
  const state: IAppState = yield select();
  const eto = selectEtoById(state, action.payload.etoId);
  if (eto) {
    yield download(eto.templates[camelCase(action.payload.documentType)]);
  }
}

function* loadTokensData({ contractsService }: TGlobalDependencies): any {
  const myAssets = yield select(selectMyAssets);
  const walletAddress = yield select(selectEthereumAddressWithChecksum);

  if (!myAssets) {
    return;
  }

  for (const eto of myAssets) {
    const equityTokenAddress = eto.contract.equityTokenAddress;

    const equityToken = yield contractsService.getEquityToken(equityTokenAddress);

    const { balance, tokensPerShare, tokenController } = yield all({
      balance: equityToken.balanceOf(walletAddress),
      tokensPerShare: equityToken.tokensPerShare,
      tokenController: equityToken.tokenController,
    });

    const controllerGovernance = yield contractsService.getControllerGovernance(tokenController);

    let [
      shareCapital,
      companyValuationEurUlps,
      ,
    ] = yield controllerGovernance.shareholderInformation();

    // backward compatibility with FF Token Controller - may be removed after controller migration
    if (Q18.gt(shareCapital)) {
      // convert shares to capital amount with nominal share value of 1 (Q18)
      shareCapital = shareCapital.mul(Q18);
    }

    // obtain nominal value of a share from IEquityToken
    let shareNominalValueUlps;
    try {
      shareNominalValueUlps = yield equityToken.shareNominalValueUlps();
    } catch (e) {
      // make it backward compatible with FF ETO, which is always and forever Q18 and does not provide method above
      shareNominalValueUlps = Q18;
    }

    // todo: use standard calcSharePrice util from calculator, after converting from wei scale
    const tokenPrice = divideBigNumbers(
      divideBigNumbers(
        multiplyBigNumbers([companyValuationEurUlps, shareNominalValueUlps]),
        shareCapital,
      ),
      tokensPerShare,
    );

    yield put(
      actions.eto.setTokenData(eto.previewCode, {
        balance: balance.toString(),
        tokensPerShare: tokensPerShare.toString(),
        totalCompanyShares: shareCapital.toString(),
        companyValuationEurUlps: companyValuationEurUlps.toString(),
        tokenPrice: tokenPrice.toString(),
      }),
    );
  }
}

function* ensureEtoJurisdiction(
  _: TGlobalDependencies,
  { payload }: TActionFromCreator<typeof actions.eto.ensureEtoJurisdiction>,
): Iterable<any> {
  const eto: ReturnType<typeof selectEtoWithCompanyAndContract> = yield select((state: IAppState) =>
    selectEtoWithCompanyAndContract(state, payload.previewCode),
  );

  if (eto === undefined) {
    throw new Error(`Can not find eto by preview code ${payload.previewCode}`);
  }
  if (eto.product.jurisdiction !== payload.jurisdiction) {
    // TODO: Add 404 page
    yield put(actions.routing.goTo404());
  }
}

function* verifyEtoAccess(
  _: TGlobalDependencies,
  { payload }: TActionFromCreator<typeof actions.eto.verifyEtoAccess>,
): Iterable<any> {
  const eto: ReturnType<typeof selectEtoWithCompanyAndContract> = yield select((state: IAppState) =>
    selectEtoWithCompanyAndContract(state, payload.previewCode),
  );

  if (eto === undefined) {
    throw new Error(`Can not find eto by preview code ${payload.previewCode}`);
  }

  const isUserLoggedInAndVerified: ReturnType<typeof selectIsUserVerified> = yield select(
    selectIsUserVerified,
  );

  // Checks if ETO is an Offer based on
  // @See https://github.com/Neufund/platform-frontend/issues/2789#issuecomment-489084892
  const isEtoAnOffer: boolean = yield select((state: IAppState) =>
    selectIsEtoAnOffer(state, payload.previewCode, eto.state),
  );

  if (isRestrictedEto(eto) && isEtoAnOffer) {
    if (isUserLoggedInAndVerified) {
      const jurisdiction: ReturnType<typeof selectClientJurisdiction> = yield select(
        selectClientJurisdiction,
      );

      if (jurisdiction === undefined) {
        throw new Error("User jurisdiction is not defined");
      }

      if (jurisdiction === ECountries.LIECHTENSTEIN) {
        yield put(actions.routing.goToDashboard());
        return;
      }
    } else {
      yield put(
        actions.genericModal.showModal(JurisdictionDisclaimerModal, {
          restrictedJurisdiction: ECountries.LIECHTENSTEIN,
        }),
      );

      const { confirmed, denied } = yield race({
        confirmed: take(actions.eto.confirmJurisdictionDisclaimer),
        denied: take(actions.genericModal.hideGenericModal),
      });

      if (denied) {
        yield put(actions.routing.goHome());
      }

      if (confirmed) {
        yield put(actions.genericModal.hideGenericModal());
      }
    }
  }
}

// TODO: Move to generic eto module (the one that's not specific to investor/issuer/nominee eto)
function* loadAgreementStatus(
  { logger }: TGlobalDependencies,
  agreementType: EAgreementType,
  eto: TEtoWithCompanyAndContract,
): Iterator<any> {
  try {
    if (!isOnChain(eto)) {
      return EEtoAgreementStatus.NOT_DONE;
    }

    const { contract, currentAgreementHash }: IAgreementContractAndHash = yield neuCall(
      getAgreementContractAndHash,
      agreementType,
      eto,
    );

    const amendmentsCount: BigNumber | undefined = yield contract.amendmentsCount;

    // if amendments counts equals 0 or undefined we can skip hash check
    if (amendmentsCount === undefined || amendmentsCount.isZero()) {
      return EEtoAgreementStatus.NOT_DONE;
    }

    // agreement indexing starts from 0 so we have to subtract 1 from amendments count
    const currentAgreementIndex = amendmentsCount.sub(1);

    const pastAgreement = yield contract.pastAgreement(currentAgreementIndex);
    const pastAgreementHash = hashFromIpfsLink(pastAgreement[2]);

    if (pastAgreementHash === currentAgreementHash) {
      return EEtoAgreementStatus.DONE;
    }

    return EEtoAgreementStatus.NOT_DONE;
  } catch (e) {
    logger.error(`Could not fetch ${agreementType} document status`, e);
    return EEtoAgreementStatus.ERROR;
  }
}

function* loadAgreementsStatus(
  _: TGlobalDependencies,
  { payload }: TActionFromCreator<typeof actions.eto.loadEtoAgreementsStatus>,
): Iterator<any> {
  const statuses: Dictionary<EEtoAgreementStatus, EAgreementType> = yield all({
    [EAgreementType.THA]: neuCall(loadAgreementStatus, EAgreementType.THA, payload.eto),
    [EAgreementType.RAAA]: neuCall(loadAgreementStatus, EAgreementType.RAAA, payload.eto),
  });

  yield put(actions.eto.setAgreementsStatus(payload.eto.previewCode, statuses));
}

export function* etoSagas(): Iterator<any> {
  yield fork(neuTakeEvery, actions.eto.loadEtoPreview, loadEtoPreview);
  yield fork(neuTakeEvery, actions.eto.loadEto, loadEto);
  yield fork(neuTakeEvery, actions.eto.loadEtos, loadEtos);
  yield fork(neuTakeEvery, actions.eto.loadTokensData, loadTokensData);
  yield fork(neuTakeEvery, actions.eto.loadEtoAgreementsStatus, loadAgreementsStatus);

  yield fork(neuTakeEvery, actions.eto.downloadEtoDocument, downloadDocument);
  yield fork(neuTakeEvery, actions.eto.downloadEtoTemplateByType, downloadTemplateByType);

  yield fork(neuTakeLatest, actions.eto.verifyEtoAccess, verifyEtoAccess);
  yield fork(neuTakeLatest, actions.eto.ensureEtoJurisdiction, ensureEtoJurisdiction);

  yield fork(neuTakeUntil, actions.eto.setEto, LOCATION_CHANGE, watchEtoSetAction);
  yield fork(neuTakeUntil, actions.eto.setEtos, LOCATION_CHANGE, watchEtosSetAction);
}
