import { storiesOf } from "@storybook/react";
import * as React from "react";

import { ERequestOutsourcedStatus, ERequestStatus } from "../../../lib/api/KycApi.interfaces";
import { EUserType } from "../../../lib/api/users/interfaces";
import { KycStatusWidgetBase } from "./KycStatusWidget";

const commonProps = {
  isUserEmailVerified: true,
  backupCodesVerified: true,
  isLoading: false,
  error: undefined,
  step: 1,
  userType: EUserType.INVESTOR,
  onGoToKycHome: () => {},
  onGoToDashboard: () => {},
  cancelInstantId: () => {},
};

storiesOf("KYC/StatusWidget", module)
  .add("email-not-verified", () => (
    <KycStatusWidgetBase
      {...commonProps}
      requestStatus={ERequestStatus.DRAFT}
      isUserEmailVerified={false}
    />
  ))
  .add("backup-codes-not-verified", () => (
    <KycStatusWidgetBase
      {...commonProps}
      requestStatus={ERequestStatus.DRAFT}
      isUserEmailVerified={true}
      backupCodesVerified={false}
    />
  ))
  .add("draft", () => <KycStatusWidgetBase {...commonProps} requestStatus={ERequestStatus.DRAFT} />)
  .add("pending", () => (
    <KycStatusWidgetBase {...commonProps} requestStatus={ERequestStatus.PENDING} />
  ))
  .add("rejected", () => (
    <KycStatusWidgetBase {...commonProps} requestStatus={ERequestStatus.REJECTED} />
  ))
  .add("accepted", () => (
    <KycStatusWidgetBase {...commonProps} requestStatus={ERequestStatus.ACCEPTED} />
  ))
  .add("outsourced-started", () => (
    <KycStatusWidgetBase
      {...commonProps}
      userType={EUserType.INVESTOR}
      requestStatus={ERequestStatus.OUTSOURCED}
      requestOutsourcedStatus={ERequestOutsourcedStatus.STARTED}
      externalKycUrl={"https://neufund.org"}
    />
  ))
  .add("outsourced-aborted", () => (
    <KycStatusWidgetBase
      {...commonProps}
      userType={EUserType.INVESTOR}
      requestStatus={ERequestStatus.OUTSOURCED}
      requestOutsourcedStatus={ERequestOutsourcedStatus.ABORTED}
    />
  ))
  .add("outsourced-canceled", () => (
    <KycStatusWidgetBase
      {...commonProps}
      userType={EUserType.INVESTOR}
      requestStatus={ERequestStatus.OUTSOURCED}
      requestOutsourcedStatus={ERequestOutsourcedStatus.CANCELED}
    />
  ))
  .add("outsourced-other", () => (
    <KycStatusWidgetBase
      {...commonProps}
      userType={EUserType.INVESTOR}
      requestStatus={ERequestStatus.OUTSOURCED}
      requestOutsourcedStatus={ERequestOutsourcedStatus.OTHER}
    />
  ))
  .add("outsourced-review_pending", () => (
    <KycStatusWidgetBase
      {...commonProps}
      userType={EUserType.INVESTOR}
      requestStatus={ERequestStatus.OUTSOURCED}
      requestOutsourcedStatus={ERequestOutsourcedStatus.REVIEW_PENDING}
    />
  ))
  .add("outsourced-success", () => (
    <KycStatusWidgetBase
      {...commonProps}
      userType={EUserType.INVESTOR}
      requestStatus={ERequestStatus.OUTSOURCED}
      requestOutsourcedStatus={ERequestOutsourcedStatus.SUCCESS}
    />
  ))
  .add("outsourced-success-data-changed", () => (
    <KycStatusWidgetBase
      {...commonProps}
      userType={EUserType.INVESTOR}
      requestStatus={ERequestStatus.OUTSOURCED}
      requestOutsourcedStatus={ERequestOutsourcedStatus.SUCCESS_DATA_CHANGED}
    />
  ))
  .add("error", () => (
    <KycStatusWidgetBase
      {...commonProps}
      error="bla bla error"
      userType={EUserType.INVESTOR}
      requestStatus={ERequestStatus.OUTSOURCED}
      requestOutsourcedStatus={ERequestOutsourcedStatus.REVIEW_PENDING}
    />
  ))
  .add("loading", () => (
    <KycStatusWidgetBase
      {...commonProps}
      isLoading={true}
      userType={EUserType.INVESTOR}
      requestStatus={ERequestStatus.OUTSOURCED}
      requestOutsourcedStatus={ERequestOutsourcedStatus.REVIEW_PENDING}
    />
  ));
