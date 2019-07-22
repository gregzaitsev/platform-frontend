import * as React from "react";
import {  FormattedMessage } from "react-intl-phraseapp";
import { ERequestOutsourcedStatus, ERequestStatus } from "../../../lib/api/KycApi.interfaces";
import { EUserType } from "../../../lib/api/users/interfaces";

import { Button, EButtonLayout, EButtonTheme } from "../../shared/buttons/Button";
import { LoadingIndicator } from "../../shared/loading-indicator/LoadingIndicator";
import { WarningAlert } from "../../shared/WarningAlert";

import * as styles from "./AccountSetupKycWidget.module.scss";

interface IStateProps {
  requestStatus?: ERequestStatus;
  requestOutsourcedStatus?: ERequestOutsourcedStatus;
  isUserEmailVerified: boolean;
  isLoading: boolean;
  backupCodesVerified: boolean;
  error?: string;
  externalKycUrl?: string;
  userType: EUserType;
}

interface IDispatchProps {
  onGoToDashboard: () => void;
  cancelInstantId: () => void;
  onGoToKycHome: () => void;
}

export const AccountSetupKycStartLayout: React.FunctionComponent<IStateProps & IDispatchProps> = ({
  isLoading,
  error,
  onGoToKycHome,
}) => {
  if (isLoading) {
    return <LoadingIndicator className={styles.loading} />;
  } else if (error) {
    return (
      <WarningAlert>
        <FormattedMessage id="settings.kyc-widget.error" />
      </WarningAlert>
    );
  } else {
    return (
      <section className={styles.accountSetupSection}>
        <p className={styles.accountSetupText}>
          <FormattedMessage id="account-setup.kyc-widget-text"/>
        </p>
        <Button
          layout={EButtonLayout.PRIMARY}
          theme={EButtonTheme.BRAND}
          type="button"
          onClick={onGoToKycHome}
          data-test-id="start-kyc-button"
        >
          <FormattedMessage id="account-setup.kyc-widget-start-kyc" />
        </Button>
      </section>
    );
  }
};
