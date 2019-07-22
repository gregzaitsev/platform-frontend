import * as React from "react";
import { FormattedMessage } from "react-intl-phraseapp";
import { TTranslatedString } from "../../../types";

import { Button, EButtonLayout, EButtonTheme } from "../../shared/buttons/Button";

import * as styles from "./AccountSetupBackupSeedWidget.module.scss";

interface IStateProps {
  backupCodesVerified: boolean;
}

interface IDispatchProps {
  startBackupProcess: () => void
}

interface IWidgetBaseProps {
  widgetDataTestId:string,
  widgetText:TTranslatedString[] | TTranslatedString,
  buttonDataTestId: string,
  buttonText:TTranslatedString,
}

const BackupCodesWidgetBase:React.FunctionComponent<IWidgetBaseProps & IDispatchProps> = ({ startBackupProcess, widgetDataTestId, widgetText, buttonDataTestId, buttonText }) =>
  <section
    data-test-id={widgetDataTestId}
    className={styles.accountSetupSection}
  >
    {Array.isArray(widgetText)
      ? widgetText.map(txt =>
      <p className={styles.accountSetupText}>
        {txt}
      </p>)
    : <p className={styles.accountSetupText}>
        {widgetText}
      </p>
    }

    <Button
      onClick={startBackupProcess}
      theme={EButtonTheme.BRAND}
      layout={EButtonLayout.PRIMARY}
      data-test-id={buttonDataTestId}
    >
      {buttonText}
    </Button>
  </section>

export const AccountSetupBackupWidgetLayout: React.FunctionComponent<IStateProps & IDispatchProps> = ({ backupCodesVerified, startBackupProcess }) =>
  backupCodesVerified
    ? <BackupCodesWidgetBase
      widgetDataTestId="backup-seed-verified-section"
      widgetText={<FormattedMessage id="settings.backup-seed-widget.backed-up-seed"/>}
      buttonDataTestId="backup-seed-verified-section.view-again"
      buttonText={<FormattedMessage id="settings.backup-seed-widget.view-again"/>}
      startBackupProcess={startBackupProcess}
    />
    : <BackupCodesWidgetBase
      widgetDataTestId="backup-seed-unverified-section"
      widgetText={
        [
        <FormattedMessage id="account-setup.backup-seed-widget.text-1"/>,
        <FormattedMessage id="account-setup.backup-seed-widget.text-2"/>,
        <FormattedMessage id="account-setup.backup-seed-widget.text-3"/>
        ]
      }
      buttonDataTestId="backup-seed-widget-link-button"
      buttonText={<FormattedMessage id="settings.backup-seed-widget.backup-phrase"/>}
      startBackupProcess={startBackupProcess}
    />;
