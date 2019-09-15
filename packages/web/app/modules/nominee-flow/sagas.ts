import BigNumber from "bignumber.js";
import { compose, isEmpty, keyBy, map, omit } from "lodash/fp";
import { delay } from "redux-saga";
import { all, fork, put, select } from "redux-saga/effects";

import {
  EEtoNomineeActiveEtoNotifications,
  ENomineeRequestErrorNotifications,
  EtoMessage,
} from "../../components/translatedMessages/messages";
import { createMessage } from "../../components/translatedMessages/utils";
import { IPFS_PROTOCOL, NOMINEE_REQUESTS_WATCHER_DELAY } from "../../config/constants";
import { TGlobalDependencies } from "../../di/setupBindings";
import {
  EEtoState,
  TCompanyEtoData,
  TEtoDataWithCompany,
  TEtoSpecsData,
  TNomineeRequestResponse,
} from "../../lib/api/eto/EtoApi.interfaces.unsafe";
import { IssuerIdInvalid, NomineeRequestExists } from "../../lib/api/eto/EtoNomineeApi";
import { nonNullable } from "../../utils/nonNullable";
import { actions, TActionFromCreator } from "../actions";
import { loadEtoContract } from "../eto/sagas";
import { TEtoWithCompanyAndContract } from "../eto/types";
import { isOnChain } from "../eto/utils";
import { loadBankAccountDetails } from "../kyc/sagas";
import { neuCall, neuTakeLatest, neuTakeUntil } from "../sagasUtils";
import { selectAgreementContractAndHash } from "../tx/transactions/nominee/sign-agreement/saga";
import {
  EAgreementType,
  IAgreementContractAndHash,
} from "../tx/transactions/nominee/sign-agreement/types";
import {
  selectActiveEtoPreviewCodeFromQueryString,
  selectNomineeActiveEtoPreviewCode,
  selectNomineeEtos,
  selectNomineeEtoWithCompanyAndContract,
} from "./selectors";
import {
  ENomineeAcceptAgreementStatus,
  ENomineeLinkBankAccountStatus,
  ENomineeRedeemShareholderCapitalStatus,
  ENomineeRequestError,
  ENomineeTask,
  ENomineeUploadIshaStatus,
  INomineeRequest,
  TNomineeRequestStorage,
} from "./types";
import { nomineeApiDataToNomineeRequests, nomineeRequestResponseToRequestStatus } from "./utils";

export function* loadNomineeTaskData({
  apiEtoNomineeService,
  logger,
  notificationCenter,
}: TGlobalDependencies): Iterator<any> {
  try {
    // load information that's needed to properly calculate nominee current task
    yield all([neuCall(loadNomineeEtos), neuCall(loadBankAccountDetails)]);

    const taskData = yield all({
      nomineeRequests: yield apiEtoNomineeService.getNomineeRequests(),
      nomineeTHAStatus: yield neuCall(loadAgreementStatus, ENomineeTask.ACCEPT_THA),
      nomineeRAAStatus: yield neuCall(loadAgreementStatus, ENomineeTask.ACCEPT_RAAA),
      // todo query here if data not in the store yet
      // linkBankAccount:
      // acceptTha:
      // redeemShareholderCapital:
      // uploadIsha:
    });

    const nomineeRequestsConverted: TNomineeRequestStorage = nomineeApiDataToNomineeRequests(
      taskData.nomineeRequests,
    );
    // todo convert data
    // const linkBankAccountConverted = ...
    // const acceptThaConverted = ...
    // const redeemShareholderCapitalConverted = ...
    // const uploadIshaConverted = ...

    yield put(
      actions.nomineeFlow.storeNomineeTaskData({
        nomineeRequests: nomineeRequestsConverted,
        linkBankAccount: ENomineeLinkBankAccountStatus.NOT_DONE,
        acceptTha: taskData.nomineeTHAStatus,
        acceptRaaa: taskData.nomineeRAAStatus,
        redeemShareholderCapital: ENomineeRedeemShareholderCapitalStatus.NOT_DONE,
        uploadIsha: ENomineeUploadIshaStatus.NOT_DONE,
      }),
    );
  } catch (e) {
    logger.error("Failed to load Nominee tasks", e);
    notificationCenter.error(
      createMessage(ENomineeRequestErrorNotifications.FETCH_NOMINEE_DATA_ERROR),
    );
    //show the user what's already loaded
    yield put(actions.nomineeFlow.loadingDone());
  }
}

export function* nomineeRequestsWatcher({ logger }: TGlobalDependencies): Iterator<any> {
  while (true) {
    logger.info("Getting nominee task data");
    try {
      yield neuCall(loadNomineeTaskData);
    } catch (e) {
      logger.error("Error getting nominee task data", e);
    }

    yield delay(NOMINEE_REQUESTS_WATCHER_DELAY);
  }
}

export function* createNomineeRequest(
  { apiEtoNomineeService, logger, notificationCenter }: TGlobalDependencies,
  action: TActionFromCreator<typeof actions.nomineeFlow.createNomineeRequest>,
): Iterator<any> {
  try {
    const nomineeRequest: TNomineeRequestResponse = yield apiEtoNomineeService.createNomineeRequest(
      action.payload.issuerId,
    );
    const nomineeRequestConverted: INomineeRequest = nomineeRequestResponseToRequestStatus(
      nomineeRequest,
    );

    yield put(
      actions.nomineeFlow.storeNomineeRequest(action.payload.issuerId, nomineeRequestConverted),
    );
  } catch (e) {
    if (e instanceof IssuerIdInvalid) {
      logger.error("Failed to create nominee request, issuer id is invalid", e);
      yield put(
        actions.nomineeFlow.storeNomineeRequestError(
          action.payload.issuerId,
          ENomineeRequestError.ISSUER_ID_ERROR,
        ),
      );
      notificationCenter.error(createMessage(ENomineeRequestErrorNotifications.ISSUER_ID_ERROR));
    } else if (e instanceof NomineeRequestExists) {
      logger.error(`Nominee request to issuerId ${action.payload.issuerId} already exists`, e);
      yield put(
        actions.nomineeFlow.storeNomineeRequestError(
          action.payload.issuerId,
          ENomineeRequestError.REQUEST_EXISTS,
        ),
      );
      notificationCenter.error(createMessage(ENomineeRequestErrorNotifications.REQUEST_EXISTS));
    } else {
      logger.error("Failed to create nominee request", e);
      yield put(
        actions.nomineeFlow.storeNomineeRequestError(
          action.payload.issuerId,
          ENomineeRequestError.GENERIC_ERROR,
        ),
      );
      notificationCenter.error(createMessage(ENomineeRequestErrorNotifications.SUBMITTING_ERROR));
    }
  } finally {
    yield put(actions.routing.goToDashboard());
    yield put(actions.nomineeFlow.loadingDone());
  }
}

function* loadAgreementStatus(
  { logger }: TGlobalDependencies,
  agreementStep: ENomineeTask.ACCEPT_RAAA | ENomineeTask.ACCEPT_THA,
): Iterator<any> {
  try {
    const agreementType =
      agreementStep === ENomineeTask.ACCEPT_RAAA ? EAgreementType.RAAA : EAgreementType.THA;
    const nomineeEto: TEtoWithCompanyAndContract = yield select(
      selectNomineeEtoWithCompanyAndContract,
    );

    if (!nomineeEto || !isOnChain(nomineeEto)) {
      return ENomineeAcceptAgreementStatus.NOT_DONE;
    }

    const { contract, currentAgreementHash }: IAgreementContractAndHash = yield neuCall(
      selectAgreementContractAndHash,
      agreementType,
      nomineeEto,
    );

    const amendmentsCount: BigNumber | undefined = yield contract.amendmentsCount;

    // if amendments counts equals 0 or undefined we can skip hash check
    if (amendmentsCount === undefined || amendmentsCount.isZero()) {
      return ENomineeAcceptAgreementStatus.NOT_DONE;
    }

    // agreement indexing starts from 0 so we have to subtract 1 from amendments count
    const currentAgreementIndex = amendmentsCount.sub(1);

    const pastAgreement = yield contract.pastAgreement(currentAgreementIndex);
    const pastAgreementHash = pastAgreement[2].replace(`${IPFS_PROTOCOL}:`, "");

    if (pastAgreementHash === currentAgreementHash) {
      return ENomineeAcceptAgreementStatus.DONE;
    }

    return ENomineeAcceptAgreementStatus.NOT_DONE;
  } catch (e) {
    logger.error("Could not fetch signed THA hash", e);
    return ENomineeAcceptAgreementStatus.ERROR;
  }
}

export function* loadNomineeEtos({
  apiEtoService,
  logger,
  notificationCenter,
}: TGlobalDependencies): Iterable<any> {
  try {
    const etos: TEtoDataWithCompany[] = yield apiEtoService.loadNomineeEtos();

    yield all(
      etos
        .filter(eto => eto.state === EEtoState.ON_CHAIN)
        .map(eto => neuCall(loadEtoContract, eto)),
    );

    const companies = compose(
      keyBy((eto: TCompanyEtoData) => eto.companyId),
      map((eto: TEtoDataWithCompany) => eto.company),
    )(etos);

    const etosByPreviewCode = compose(
      keyBy((eto: TEtoSpecsData) => eto.previewCode),
      // remove company prop from eto
      // it's saved separately for consistency with other endpoints
      map(omit("company")),
    )(etos);

    yield put(actions.nomineeFlow.setNomineeEtos({ etos: etosByPreviewCode, companies }));
  } catch (e) {
    logger.error("Nominee ETOs could not be loaded", e);

    notificationCenter.error(createMessage(EtoMessage.COULD_NOT_LOAD_ETOS));
  }
}

export function* guardActiveEto({
  logger,
  notificationCenter,
}: TGlobalDependencies): Iterable<any> {
  try {
    const etos: ReturnType<typeof selectNomineeEtos> = yield select(selectNomineeEtos);
    const previewCode: ReturnType<typeof selectNomineeActiveEtoPreviewCode> = yield select(
      selectNomineeActiveEtoPreviewCode,
    );
    const forcedActiveEtoPreviewCode: ReturnType<
      typeof selectActiveEtoPreviewCodeFromQueryString
    > = yield select(selectActiveEtoPreviewCodeFromQueryString);

    if (isEmpty(etos)) {
      if (previewCode !== undefined) {
        yield put(actions.nomineeFlow.setActiveNomineeEto(undefined));
      }
    } else {
      // For testing purpose we can force another ETO to be active (by default it's the first one)
      const shouldForceSpecificEtoToBeActive =
        forcedActiveEtoPreviewCode !== undefined &&
        forcedActiveEtoPreviewCode !== previewCode &&
        etos[forcedActiveEtoPreviewCode] !== undefined;

      const doesActiveEtoExist = previewCode === undefined || etos[previewCode] === undefined;

      if (shouldForceSpecificEtoToBeActive) {
        yield put(actions.nomineeFlow.setActiveNomineeEto(forcedActiveEtoPreviewCode));

        notificationCenter.info(
          createMessage(EEtoNomineeActiveEtoNotifications.ACTIVE_ETO_SET_SUCCESS),
        );
      } else if (doesActiveEtoExist) {
        const firstEto = nonNullable(Object.values(etos)[0]);
        yield put(actions.nomineeFlow.setActiveNomineeEto(firstEto.previewCode));
      }
    }
  } catch (e) {
    logger.fatal("Could not set active eto", e);

    notificationCenter.error(createMessage(EEtoNomineeActiveEtoNotifications.ACTIVE_ETO_SET_ERROR));
  }
}

export function* nomineeFlowSagas(): Iterator<any> {
  yield fork(neuTakeLatest, actions.nomineeFlow.loadNomineeEtos, loadNomineeEtos);
  yield fork(neuTakeLatest, actions.nomineeFlow.createNomineeRequest, createNomineeRequest);
  yield fork(neuTakeLatest, actions.nomineeFlow.loadNomineeTaskData, loadNomineeTaskData);
  yield fork(neuTakeLatest, actions.nomineeFlow.setNomineeEtos, guardActiveEto);
  yield fork(
    neuTakeUntil,
    actions.nomineeFlow.startNomineeRequestsWatcher,
    actions.nomineeFlow.stopNomineeRequestsWatcher,
    nomineeRequestsWatcher,
  );
}
