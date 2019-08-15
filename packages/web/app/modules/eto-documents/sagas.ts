import { findKey } from "lodash/fp";
import { all, call, fork, put, select } from "redux-saga/effects";

import { EtoDocumentsMessage, IpfsMessage } from "../../components/translatedMessages/messages";
import { createMessage } from "../../components/translatedMessages/utils";
import { EJwtPermissions } from "../../config/constants";
import { TGlobalDependencies } from "../../di/setupBindings";
import { EEtoState } from "../../lib/api/eto/EtoApi.interfaces.unsafe";
import { FileAlreadyExists } from "../../lib/api/eto/EtoFileApi";
import {
  EEtoDocumentType,
  TEtoDocumentTemplates,
  TStateInfo,
} from "../../lib/api/eto/EtoFileApi.interfaces";
import { actions, TActionFromCreator } from "../actions";
import { ensurePermissionsArePresentAndRunEffect } from "../auth/jwt/sagas";
import { loadIssuerEto } from "../eto-flow/sagas";
import {
  selectIssuerEtoDocuments,
  selectIssuerEtoId,
  selectIssuerEtoProduct,
  selectIssuerEtoState,
} from "../eto-flow/selectors";
import { downloadLink } from "../immutable-file/utils";
import { neuCall, neuTakeEvery } from "../sagasUtils";
import { selectEthereumAddressWithChecksum } from "../web3/selectors";

export function* generateDocumentFromTemplate(
  { apiImmutableStorage, notificationCenter, logger, apiEtoFileService }: TGlobalDependencies,
  action: TActionFromCreator<typeof actions.etoDocuments.generateTemplate>,
): Iterator<any> {
  try {
    const document = action.payload.document;

    const etoState: EEtoState = yield select(selectIssuerEtoState);

    let resolvedTemplate = null;

    yield put(actions.immutableStorage.downloadDocumentStarted(document.ipfsHash));

    // resolve all documents if not on-chain, otherwise resolve only ISHA summary
    if (
      etoState !== EEtoState.ON_CHAIN ||
      document.documentType === EEtoDocumentType.INVESTMENT_SUMMARY_TEMPLATE
    ) {
      resolvedTemplate = yield apiEtoFileService.getEtoTemplate(
        {
          documentType: document.documentType,
          name: document.name,
          form: "template",
          ipfsHash: document.ipfsHash,
          mimeType: document.mimeType,
        },
        // token_holder_ethereum_address is a required input for an on-chain resolver
        etoState === EEtoState.ON_CHAIN
          ? { token_holder_ethereum_address: "0x0000000000000000000000000000000000000000" }
          : {},
      );
    }

    const generatedDocument = yield apiImmutableStorage.getFile({
      ipfsHash: document.ipfsHash,
      mimeType: document.mimeType,
      placeholders: resolvedTemplate ? resolvedTemplate.placeholders : undefined,
      asPdf: false,
    });

    yield call(downloadLink, generatedDocument, document.name, ".doc");
  } catch (e) {
    logger.error("Failed to generate ETO template", e);
    notificationCenter.error(createMessage(IpfsMessage.IPFS_FAILED_TO_DOWNLOAD_IPFS_FILE));
  } finally {
    yield put(actions.immutableStorage.downloadImmutableFileDone(action.payload.document.ipfsHash));
  }
}

export function* generateDocumentFromTemplateByEtoId(
  { apiImmutableStorage, notificationCenter, logger, apiEtoFileService }: TGlobalDependencies,
  action: TActionFromCreator<typeof actions.etoDocuments.generateTemplateByEtoId>,
): any {
  try {
    const userEthAddress = yield select(selectEthereumAddressWithChecksum);
    const document = action.payload.document;
    const etoId = action.payload.etoId;
    const extension = document.asPdf ? ".pdf" : ".doc";

    yield put(actions.immutableStorage.downloadDocumentStarted(document.ipfsHash));
    const templates = yield apiEtoFileService.getSpecificEtoTemplate(
      etoId,
      {
        documentType: document.documentType,
        name: document.name,
        form: "template",
        ipfsHash: document.ipfsHash,
        mimeType: document.mimeType,
      },
      // token holder is required in on-chain state, use non-existing address
      // to obtain issuer side template
      { token_holder_ethereum_address: userEthAddress },
    );
    const generatedDocument = yield apiImmutableStorage.getFile({
      ...{
        ipfsHash: templates.ipfs_hash,
        mimeType: templates.mime_type,
        placeholders: templates.placeholders,
      },
      asPdf: true,
    });
    yield call(downloadLink, generatedDocument, document.name, extension);
  } catch (e) {
    logger.error("Failed to generate ETO template", e);
    notificationCenter.error(createMessage(IpfsMessage.IPFS_FAILED_TO_DOWNLOAD_IPFS_FILE));
  } finally {
    yield put(actions.immutableStorage.downloadImmutableFileDone(action.payload.document.ipfsHash));
  }
}

export function* downloadDocumentStart(
  { apiImmutableStorage, notificationCenter, logger }: TGlobalDependencies,
  action: TActionFromCreator<typeof actions.etoDocuments.downloadDocumentStart>,
): any {
  try {
    const matchingDocument = yield getDocumentOfType(action.payload.documentType);
    const downloadedDocument = yield apiImmutableStorage.getFile({
      ipfsHash: matchingDocument.ipfsHash,
      mimeType: matchingDocument.mimeType,
      asPdf: true,
    });
    yield call(downloadLink, downloadedDocument, matchingDocument.name, "");
  } catch (e) {
    logger.error("Download document by type failed", e);
    notificationCenter.error(
      createMessage(EtoDocumentsMessage.ETO_DOCUMENTS_FAILED_TO_DOWNLOAD_FILE),
    );
  } finally {
    yield put(actions.etoDocuments.downloadDocumentFinish(action.payload.documentType));
  }
}

export function* loadEtoFilesInfo({
  notificationCenter,
  apiEtoFileService,
  apiEtoProductService,
  logger,
}: TGlobalDependencies): Iterator<any> {
  try {
    const etoId = yield select(selectIssuerEtoId);
    if (!etoId) {
      // issuer eto must no be loaded so load it now
      yield neuCall(loadIssuerEto);
    }
    const product = yield select(selectIssuerEtoProduct);
    const {
      documentsStateInfo,
      productTemplates,
    }: { documentsStateInfo: TStateInfo; productTemplates: TEtoDocumentTemplates } = yield all({
      documentsStateInfo: apiEtoFileService.getEtoFileStateInfo(),
      productTemplates: apiEtoProductService.getProductTemplates(product.id),
    });

    yield put(
      actions.etoDocuments.loadEtoFilesInfo({
        productTemplates,
        documentsStateInfo,
      }),
    );
  } catch (e) {
    logger.error("Load ETO data failed", e);
    notificationCenter.error(
      createMessage(EtoDocumentsMessage.ETO_DOCUMENTS_FAILED_TO_ACCESS_ETO_FILES_DATA),
    );
    yield put(actions.routing.goToDashboard());
  }
}

function* getDocumentOfType(documentType: EEtoDocumentType): Iterator<any> {
  const documents: TEtoDocumentTemplates = yield select(selectIssuerEtoDocuments);

  const matchingDocument = findKey(document => document.documentType === documentType, documents);

  return documents[matchingDocument!];
}

function* uploadEtoFileEffect(
  { apiEtoFileService, notificationCenter }: TGlobalDependencies,
  file: File,
  documentType: EEtoDocumentType,
): Iterator<any> {
  const matchingDocument = yield getDocumentOfType(documentType);
  if (matchingDocument)
    yield apiEtoFileService.deleteSpecificEtoDocument(matchingDocument.ipfsHash);

  yield apiEtoFileService.uploadEtoDocument(file, documentType);
  notificationCenter.info(createMessage(EtoDocumentsMessage.ETO_DOCUMENTS_FILE_UPLOADED));
}

function* uploadEtoFile(
  { notificationCenter, logger }: TGlobalDependencies,
  action: TActionFromCreator<typeof actions.etoDocuments.etoUploadDocumentStart>,
): Iterator<any> {
  const { file, documentType } = action.payload;
  try {
    yield put(actions.etoDocuments.hideIpfsModal());

    yield neuCall(
      ensurePermissionsArePresentAndRunEffect,
      neuCall(uploadEtoFileEffect, file, documentType),
      [EJwtPermissions.UPLOAD_IMMUTABLE_DOCUMENT],
      createMessage(EtoDocumentsMessage.ETO_DOCUMENTS_CONFIRM_UPLOAD_DOCUMENT_TITLE),
      createMessage(EtoDocumentsMessage.ETO_DOCUMENTS_CONFIRM_UPLOAD_DOCUMENT_DESCRIPTION),
    );
  } catch (e) {
    if (e instanceof FileAlreadyExists) {
      notificationCenter.error(createMessage(EtoDocumentsMessage.ETO_DOCUMENTS_FILE_EXISTS));
    } else {
      logger.error("Failed to send ETO data", e);
      notificationCenter.error(createMessage(EtoDocumentsMessage.ETO_DOCUMENTS_FILE_UPLOAD_FAILED));
    }
  } finally {
    yield neuCall(loadIssuerEto);
    if (documentType === EEtoDocumentType.INVESTMENT_AND_SHAREHOLDER_AGREEMENT) {
      const etoId = yield select(selectIssuerEtoId);
      const etoDocuments: TEtoDocumentTemplates = yield select(selectIssuerEtoDocuments);
      const uploadResult = Object.values(etoDocuments).find(d => d.documentType === documentType)!;
      yield put(actions.etoFlow.signInvestmentAgreement(etoId, uploadResult.ipfsHash));
    }
    yield put(actions.etoDocuments.etoUploadDocumentFinish(documentType));
  }
}

export function* etoDocumentsSagas(): any {
  yield fork(
    neuTakeEvery,
    actions.etoDocuments.generateTemplateByEtoId,
    generateDocumentFromTemplateByEtoId,
  );
  yield fork(neuTakeEvery, actions.etoDocuments.generateTemplate, generateDocumentFromTemplate);
  yield fork(neuTakeEvery, actions.etoDocuments.loadFileDataStart, loadEtoFilesInfo);
  yield fork(neuTakeEvery, actions.etoDocuments.etoUploadDocumentStart, uploadEtoFile);
  yield fork(neuTakeEvery, actions.etoDocuments.downloadDocumentStart, downloadDocumentStart);
}
