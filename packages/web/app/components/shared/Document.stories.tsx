import { action } from "@storybook/addon-actions";
import { storiesOf } from "@storybook/react";
import * as React from "react";

import { EEtoDocumentType } from "../../lib/api/eto/EtoFileApi.interfaces";
import { Document, DocumentTile } from "./Document";
import { DocumentUploadableTile } from "./DocumentUploadable";

storiesOf("Document", module)
  .add("doc", () => <Document extension="doc" />)
  .add("pdf", () => <Document extension="pdf" />)
  .add("document tile blank, not active", () => (
    <DocumentTile
      extension="pdf"
      title="document title"
      onlyDownload={true}
      blank={true}
      active={false}
      busy={false}
      fileName="file_name"
      downloadAction={() => action("DOWNLOAD")}
    />
  ))
  .add("document tile blank, active", () => (
    <DocumentTile
      extension="pdf"
      title="document title"
      onlyDownload={true}
      blank={true}
      active={true}
      busy={false}
      fileName="file_name"
      downloadAction={() => action("DOWNLOAD")}
    />
  ))
  .add("document tile not blank, active", () => (
    <DocumentTile
      extension="pdf"
      title="document title"
      onlyDownload={true}
      blank={false}
      active={true}
      busy={false}
      fileName="file_name"
      downloadAction={() => action("DOWNLOAD")}
    />
  ))
  .add("document tile not blank, active, busy", () => (
    <DocumentTile
      extension="pdf"
      title="document title"
      onlyDownload={true}
      blank={false}
      active={true}
      busy={true}
      fileName="file_name"
      downloadAction={() => action("DOWNLOAD")}
    />
  ))
  .add("generated document tile", () => (
    <DocumentTile
      extension="doc"
      title="generated document title"
      onlyDownload={true}
      blank={false}
      active={true}
      busy={false}
      fileName="file_name"
      downloadAction={() => action("DOWNLOAD")}
    />
  ))
  .add("uploadable document tile", () => (
    <>
      <DocumentUploadableTile
        active={true}
        documentKey={EEtoDocumentType.INVESTMENT_AND_SHAREHOLDER_AGREEMENT}
        typedFileName={"investment agreement"}
        isFileUploaded={false}
        downloadDocumentStart={() => {}}
        documentDownloadLinkInactive={false}
        busy={false}
      />
      <br />
      <DocumentUploadableTile
        active={true}
        documentKey={EEtoDocumentType.INVESTMENT_AND_SHAREHOLDER_AGREEMENT}
        typedFileName={"investment agreement"}
        isFileUploaded={false}
        downloadDocumentStart={() => {}}
        documentDownloadLinkInactive={false}
        busy={false}
        disabled={true}
      />
      <br />
      <DocumentUploadableTile
        active={true}
        documentKey={EEtoDocumentType.INVESTMENT_AND_SHAREHOLDER_AGREEMENT}
        typedFileName={"investment agreement"}
        isFileUploaded={false}
        downloadDocumentStart={() => {}}
        documentDownloadLinkInactive={false}
        busy={true}
      />
    </>
  ))
  .add("uploadable document tile full", () => (
    <>
      <DocumentUploadableTile
        active={true}
        documentKey={EEtoDocumentType.INVESTMENT_AND_SHAREHOLDER_AGREEMENT}
        typedFileName={"investment agreement"}
        isFileUploaded={false}
        downloadDocumentStart={() => {}}
        documentDownloadLinkInactive={false}
        busy={false}
      />
      <br />
      <DocumentUploadableTile
        active={true}
        documentKey={EEtoDocumentType.INVESTMENT_AND_SHAREHOLDER_AGREEMENT}
        typedFileName={"investment agreement"}
        isFileUploaded={true}
        downloadDocumentStart={() => {}}
        documentDownloadLinkInactive={false}
        busy={false}
      />
    </>
  ))
  .add("uploadable document tile full busy", () => (
    <DocumentUploadableTile
      active={true}
      documentKey={EEtoDocumentType.INVESTMENT_AND_SHAREHOLDER_AGREEMENT}
      typedFileName={"investment agreement"}
      isFileUploaded={false}
      downloadDocumentStart={() => {}}
      documentDownloadLinkInactive={true}
      busy={true}
    />
  ));
