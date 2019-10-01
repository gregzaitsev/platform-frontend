import * as cn from "classnames";
import * as React from "react";
import { FormattedMessage } from "react-intl-phraseapp";

import { EEtoDocumentType } from "../../lib/api/eto/EtoFileApi.interfaces";
import { TTranslatedString } from "../../types";
import { ETOAddDocuments } from "../eto/shared/EtoAddDocument";
import { Button, ButtonSize, EButtonLayout, EButtonTheme, EIconPosition } from "./buttons/Button";
import { RoundedButton } from "./buttons/RoudnedButton";
import { DocumentTile } from "./Document";
import { InlineIcon } from "./icons/InlineIcon";

import * as upload from "../../assets/img/inline_icons/cloud.svg";
import * as error from "../../assets/img/inline_icons/error.svg";
import * as spinner from "../../assets/img/inline_icons/spinner.svg";
import * as warning from "../../assets/img/inline_icons/warning.svg";
import * as styles from "./Document.module.scss";

interface IUploadableDocumentTileProps {
  documentKey: EEtoDocumentType;
  active: boolean;
  typedFileName: TTranslatedString;
  isFileUploaded: boolean;
  downloadDocumentStart: (documentType: EEtoDocumentType) => void;
  startDocumentRemove: (documentType: EEtoDocumentType) => void;
  documentDownloadLinkInactive: boolean;
  busy?: boolean;
  disabled?: boolean;
}

export const DocumentUploadableTile: React.FunctionComponent<IUploadableDocumentTileProps> = ({
  documentKey,
  active,
  typedFileName,
  isFileUploaded,
  downloadDocumentStart,
  documentDownloadLinkInactive,
  busy,
  disabled,
  startDocumentRemove,
}) => {
  const [rejected, setRejected] = React.useState(false);

  const linkDisabled = documentDownloadLinkInactive || busy;

  return (
    <div data-test-id={`form.name.${documentKey}`}>
      {isFileUploaded ? (
        <>
          <DocumentTile
            title={typedFileName}
            extension={".pdf"}
            active={active}
            blank={!isFileUploaded}
            busy={linkDisabled}
            downloadAction={() => downloadDocumentStart(documentKey)}
            fileName={documentKey}
            removeAction={() => startDocumentRemove(documentKey)}
          />
        </>
      ) : (
        <>
          <ETOAddDocuments
            documentType={documentKey}
            disabled={!active || busy || disabled}
            maxSize={20 * 1024}
            onDropRejected={() => setRejected(true)}
            onDropAccepted={() => setRejected(false)}
          >
            {busy && (
              <div className={styles.documentBusy}>
                <InlineIcon svgIcon={spinner} className={styles.spinner} />
                <FormattedMessage id="documents.uploading" />
              </div>
            )}
            <RoundedButton
              disabled={!active || busy || disabled}
              layout={EButtonLayout.SECONDARY}
              theme={EButtonTheme.NEON}
              data-test-id={`form.name.${documentKey}.upload`}
              iconPosition={EIconPosition.ICON_BEFORE}
              svgIcon={upload}
              iconStyle={cn("inline-icon", styles.uploadIcon)}
            >
              <FormattedMessage id="documents.upload.upload" />
            </RoundedButton>
            <p className={cn(styles.dragDescription)}>
              <FormattedMessage id="documents.upload.drag-n-drop" />
            </p>
          </ETOAddDocuments>
          <p className={styles.uploadTitle}>{typedFileName}</p>
          <p className={styles.fileSize}>
            <FormattedMessage id="documents.upload.file-size" values={{ size: "20MB" }} />
          </p>
          {rejected && (
            <div className={styles.error}>
              <InlineIcon svgIcon={error} className={styles.errorIcon} />
              <p>
                <FormattedMessage id="documents.upload.file-rejected" />
              </p>
            </div>
          )}
          {/* TODO: Show when ETO terms changed*/}
          {active && isFileUploaded && (
            <>
              <Button
                data-test-id="documents-download-document"
                onClick={() => downloadDocumentStart(documentKey)}
                layout={EButtonLayout.INLINE}
                size={ButtonSize.SMALL}
              >
                {documentKey}.pdf
              </Button>
              <div className={styles.warning}>
                <InlineIcon svgIcon={warning} className={styles.warningIcon} />
                <p>
                  <FormattedMessage id="documents.upload.terms-changed" />
                </p>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
};
