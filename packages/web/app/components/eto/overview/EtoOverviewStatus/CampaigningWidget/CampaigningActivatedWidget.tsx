import * as React from "react";

import { EWhitelistingState } from "../../../../../modules/bookbuilding-flow/utils";
import { CounterWidget } from "../index";
import {
  connectCampaigningActivatedWidget,
  TComponentProps,
} from "./connectCampaigningActivatedWidget";
import { WhitelistingActive } from "./WhitelistingActive";
import { WhitelistingLimitReached } from "./WhitelistingLimitReached";
import { WhitelistingNotActive } from "./WhitelistingNotActive";
import { WhitelistingSuspended } from "./WhitelistingSuspended";

const CampaigningActivatedWidgetComponent: React.FunctionComponent<TComponentProps> = ({
  investorsLimit,
  pledgedAmount,
  investorsCount,
  isInvestor,
  etoId,
  minPledge,
  maxPledge,
  nextState,
  countdownDate,
  keyQuoteFounder,
  pledge,
  isVerifiedInvestor,
  whitelistingState,
}) => {
  switch (whitelistingState) {
    case EWhitelistingState.ACTIVE:
      return (
        <WhitelistingActive
          investorsLimit={investorsLimit}
          isInvestor={isInvestor}
          etoId={etoId}
          minPledge={minPledge}
          maxPledge={maxPledge}
          pledge={pledge}
          isVerifiedInvestor={isVerifiedInvestor}
          investorsCount={investorsCount}
          pledgedAmount={pledgedAmount}
        />
      );
    case EWhitelistingState.LIMIT_REACHED:
      return (
        <>
          <WhitelistingLimitReached pledgedAmount={pledgedAmount} investorsCount={investorsCount} />
          {countdownDate && (
            <CounterWidget endDate={countdownDate} awaitedState={nextState} etoId={etoId} />
          )}
        </>
      );
    case EWhitelistingState.SUSPENDED:
    case EWhitelistingState.STOPPED:
      return (
        <>
          <WhitelistingSuspended pledgedAmount={pledgedAmount} investorsCount={investorsCount} />
          {countdownDate && (
            <CounterWidget endDate={countdownDate} awaitedState={nextState} etoId={etoId} />
          )}
        </>
      );
    case EWhitelistingState.NOT_ACTIVE:
    default:
      return <WhitelistingNotActive keyQuoteFounder={keyQuoteFounder} />;
  }
};

const CampaigningActivatedWidget = connectCampaigningActivatedWidget(
  CampaigningActivatedWidgetComponent,
);

export { CampaigningActivatedWidget, CampaigningActivatedWidgetComponent };
