import * as cn from "classnames";
import * as React from "react";
import { FormattedMessage } from "react-intl-phraseapp";

import {
  EEtoMarketingDataVisibleInPreview,
  EEtoState,
} from "../../../lib/api/eto/EtoApi.interfaces.unsafe";
import {
  EETOStateOnChain,
  EEtoSubState,
  TEtoWithCompanyAndContract,
} from "../../../modules/eto/types";
import { isOnChain } from "../../../modules/eto/utils";
import { CommonHtmlProps, TTranslatedString } from "../../../types";

import * as styles from "./ETOState.module.scss";

export enum EProjectStatusSize {
  MEDIUM = "medium",
  LARGE = "large",
  SMALL = "small",
  HUGE = "huge",
}

export enum EProjectStatusLayout {
  NORMAL = "normal",
  BLACK = "black",
  INHERIT = "inherit",
}

interface IExternalProps {
  eto: TEtoWithCompanyAndContract;
  isIssuer: boolean;
}

interface ISizeLayoutProps {
  size?: EProjectStatusSize;
  layout?: EProjectStatusLayout;
}

interface IComingSoonEtoStateProps {
  isIssuer: boolean;
}

export const stateToName: Record<EEtoState | EETOStateOnChain | EEtoSubState, TTranslatedString> = {
  [EEtoState.PREVIEW]: <FormattedMessage id="shared-component.eto-overview.status-in-preview" />,
  [EEtoState.PENDING]: <FormattedMessage id="shared-component.eto-overview.status-pending" />,
  [EEtoState.LISTED]: <FormattedMessage id="shared-component.eto-overview.status-listed" />,
  [EEtoState.PROSPECTUS_APPROVED]: (
    <FormattedMessage id="shared-component.eto-overview.status-prospectus-approved" />
  ),
  [EEtoState.ON_CHAIN]: <FormattedMessage id="shared-component.eto-overview.status-on-chain" />,

  // on chain state mappings
  [EETOStateOnChain.Setup]: <FormattedMessage id="eto.status.onchain.setup" />,
  [EETOStateOnChain.Whitelist]: <FormattedMessage id="eto.status.onchain.whitelist" />,
  [EETOStateOnChain.Public]: <FormattedMessage id="eto.status.onchain.public" />,
  [EETOStateOnChain.Signing]: <FormattedMessage id="eto.status.onchain.signing" />,
  [EETOStateOnChain.Claim]: <FormattedMessage id="eto.status.onchain.claim" />,
  [EETOStateOnChain.Payout]: <FormattedMessage id="eto.status.onchain.payout" />,
  [EETOStateOnChain.Refund]: <FormattedMessage id="eto.status.onchain.refund" />,

  // on chain sub state mappings
  [EEtoSubState.COMING_SOON]: <FormattedMessage id="eto.status.sub-state.coming-soon" />,
  [EEtoSubState.CAMPAIGNING]: <FormattedMessage id="eto.status.onchain.setup" />,
  [EEtoSubState.WHITELISTING]: <FormattedMessage id="eto.status.sub-state.whitelisting" />,
  [EEtoSubState.WHITELISTING_LIMIT_REACHED]: <FormattedMessage id="eto.status.onchain.setup" />,
  [EEtoSubState.COUNTDOWN_TO_PRESALE]: <FormattedMessage id="eto.status.onchain.setup" />,
  [EEtoSubState.COUNTDOWN_TO_PUBLIC_SALE]: <FormattedMessage id="eto.status.onchain.setup" />,
};

export const getStateName: (
  state: EEtoState | EETOStateOnChain | EEtoSubState,
  isIssuer: boolean,
) => TTranslatedString = (state, isIssuer) => {
  if (isIssuer && (state === EETOStateOnChain.Payout || state === EETOStateOnChain.Claim)) {
    return <FormattedMessage id="eto.status.onchain.issuer-withdraw-funds" />;
  }

  return stateToName[state];
};

const stateToClassName: Partial<Record<EEtoState | EETOStateOnChain | EEtoSubState, string>> = {
  [EEtoState.PREVIEW]: styles.blue,
  [EEtoState.PENDING]: styles.red,
  // eto on chain states
  [EETOStateOnChain.Whitelist]: styles.green,
  [EETOStateOnChain.Public]: styles.green,
  [EETOStateOnChain.Claim]: styles.green,
  [EETOStateOnChain.Payout]: styles.green,
  [EETOStateOnChain.Refund]: styles.red,
  [EETOStateOnChain.Signing]: styles.blue,

  // eto sub states
  [EEtoSubState.COMING_SOON]: styles.green,
  [EEtoSubState.CAMPAIGNING]: styles.blue,
  [EEtoSubState.WHITELISTING_LIMIT_REACHED]: styles.blue,
  [EEtoSubState.WHITELISTING]: styles.green,
  [EEtoSubState.COUNTDOWN_TO_PUBLIC_SALE]: styles.blue,
  [EEtoSubState.COUNTDOWN_TO_PRESALE]: styles.blue,
};

const getState = (
  eto: TEtoWithCompanyAndContract,
  isIssuer: boolean,
): EETOStateOnChain | EEtoState | EEtoSubState => {
  const state = isOnChain(eto) ? eto.contract.timedState : eto.state;

  if (eto.subState) {
    return isIssuer &&
      eto.isMarketingDataVisibleInPreview !== EEtoMarketingDataVisibleInPreview.VISIBLE
      ? state
      : eto.subState;
  } else {
    return state;
  }
};

const ComingSoonEtoState: React.FunctionComponent<
  ISizeLayoutProps & IComingSoonEtoStateProps & CommonHtmlProps
> = ({
  className,
  size = EProjectStatusSize.MEDIUM,
  layout = EProjectStatusLayout.NORMAL,
  isIssuer,
}) => {
  const state = EEtoSubState.COMING_SOON;

  return (
    <div
      className={cn(styles.projectStatus, stateToClassName[state], size, layout, className)}
      data-test-id={`eto-state-${state}`}
    >
      {getStateName(state, isIssuer)}
    </div>
  );
};

const SuccessEtoState: React.FunctionComponent<ISizeLayoutProps & CommonHtmlProps> = ({
  className,
  size = EProjectStatusSize.MEDIUM,
  layout = EProjectStatusLayout.NORMAL,
}) => (
  <div
    className={cn(styles.projectStatus, styles.green, size, layout, className)}
    data-test-id="eto-state-mock-successful"
  >
    <FormattedMessage id="eto.status.mock.success" />
  </div>
);

const ETOState: React.FunctionComponent<IExternalProps & ISizeLayoutProps & CommonHtmlProps> = ({
  eto,
  className,
  size = EProjectStatusSize.MEDIUM,
  layout = EProjectStatusLayout.NORMAL,
  isIssuer,
}) => {
  const state = getState(eto, isIssuer);

  return (
    <div
      className={cn(styles.projectStatus, stateToClassName[state], size, layout, className)}
      data-test-id={`eto-state-${state}`}
    >
      {getStateName(state, isIssuer)}
    </div>
  );
};

export { ETOState, ComingSoonEtoState, SuccessEtoState };
