import * as cn from "classnames";
import * as React from "react";
import { FormattedMessage } from "react-intl-phraseapp";
import { compose } from "recompose";

import * as arrowRight from "../../../assets/img/inline_icons/arrow_right.svg";
import * as successIcon from "../../../assets/img/notifications/success.svg";
import * as warningIcon from "../../../assets/img/notifications/warning.svg";
import { actions } from "../../../modules/actions";

import { selectBackupCodesVerified } from "../../../modules/auth/selectors";
import { appConnect } from "../../../store";
import { EColumnSpan } from "../../layouts/Container";
import { ButtonLink, EButtonLayout, EIconPosition } from "../../shared/buttons/index";
import { Panel } from "../../shared/Panel";
import { profileRoutes } from "../routes";
import { AccountSetupBackupWidgetLayout } from "./AccountSetupBackupSeedWidget";

import * as styles from "./BackupSeedWidget.module.scss";

interface IStateProps {
  backupCodesVerified: boolean;
}

interface IDispatchProps {
  startBackupProcess: () => void
}

interface IExternalProps {
  columnSpan?: EColumnSpan;
  step: number;
}

const BackupSeedWidgetBase: React.FunctionComponent<IStateProps & IExternalProps> = ({
  backupCodesVerified,
  columnSpan,
}) => (
  <Panel
    columnSpan={columnSpan}
    headerText={<FormattedMessage id="settings.backup-seed-widget.header" />}
    rightComponent={
      backupCodesVerified ? (
        <img src={successIcon} className={styles.icon} aria-hidden="true" />
      ) : (
        <img src={warningIcon} className={styles.icon} aria-hidden="true" />
      )
    }
    data-test-id="profile.backup-seed-widget"
  >
    {backupCodesVerified ? (
      <section
        data-test-id="backup-seed-verified-section"
        className={cn(styles.section, "d-flex flex-wrap align-content-around")}
      >
        <p className={cn(styles.text, "pt-2")}>
          <FormattedMessage id="settings.backup-seed-widget.backed-up-seed" />
        </p>
        <ButtonLink
          to={profileRoutes.seedBackup}
          layout={EButtonLayout.SECONDARY}
          iconPosition={EIconPosition.ICON_AFTER}
          svgIcon={arrowRight}
          data-test-id="backup-seed-verified-section.view-again"
        >
          <FormattedMessage id="settings.backup-seed-widget.view-again" />
        </ButtonLink>
      </section>
    ) : (
      <section
        data-test-id="backup-seed-unverified-section"
        className={cn(styles.section, "d-flex flex-wrap align-content-around")}
      >
        <p className={cn(styles.text, "pt-2")}>
          <FormattedMessage id="settings.backup-seed-widget.write-down-recovery-phrase" />
        </p>
        <ButtonLink
          to={profileRoutes.seedBackup}
          data-test-id="backup-seed-widget-link-button"
          layout={EButtonLayout.SECONDARY}
          iconPosition={EIconPosition.ICON_AFTER}
          svgIcon={arrowRight}
        >
          <FormattedMessage id="settings.backup-seed-widget.backup-phrase" />
        </ButtonLink>
      </section>
    )}
  </Panel>
);

const connectBackupSeedWidget = <T extends {}>(
  WrappedComponent: React.ComponentType<IStateProps & IDispatchProps & T>,
) =>
  compose<IStateProps & IDispatchProps & T, T>(
    appConnect<IStateProps, IDispatchProps, T>({
      stateToProps: s => ({
        backupCodesVerified: selectBackupCodesVerified(s),
      }),
      dispatchToProps: dispatch => ({
        startBackupProcess: () => dispatch(actions.routing.goToSeedBackup())
      })
    }),
  )(WrappedComponent);

const BackupSeedWidget = connectBackupSeedWidget<IExternalProps>(BackupSeedWidgetBase);
const BackupSeedComponent = connectBackupSeedWidget<{}>(AccountSetupBackupWidgetLayout);

export { BackupSeedWidget, BackupSeedComponent, BackupSeedWidgetBase };
