import { storiesOf } from "@storybook/react";
import * as moment from "moment";
import * as React from "react";

import { EWhitelistingState } from "../../../../../modules/bookbuilding-flow/utils";
import { EETOStateOnChain } from "../../../../../modules/eto/types";
import { withStore } from "../../../../../utils/storeDecorator.unsafe";
import { ECurrency } from "../../../../shared/formatters/utils";
import { Panel } from "../../../../shared/Panel";
import { CampaigningActivatedWidgetComponent } from "./CampaigningActivatedWidget";

storiesOf("ETO/CampaigningActivatedWidgetComponent", module)
  .addDecorator(withStore({}))
  .addDecorator(story => <Panel>{story()}</Panel>)
  .add("Active, verified investor view, investor didn't pledge", () => (
    <CampaigningActivatedWidgetComponent
      whitelistingState={EWhitelistingState.ACTIVE}
      countdownDate={undefined}
      etoId="test"
      investorsLimit={500}
      minPledge={10}
      nextState={EETOStateOnChain.Public}
      keyQuoteFounder="Quotes are like boats"
      pledgedAmount={0}
      investorsCount={5}
      isInvestor={true}
      isVerifiedInvestor={true}
    />
  ))
  .add("Active, verified investor view, investor did pledge", () => (
    <CampaigningActivatedWidgetComponent
      whitelistingState={EWhitelistingState.ACTIVE}
      countdownDate={undefined}
      etoId="test"
      investorsLimit={500}
      minPledge={10}
      nextState={EETOStateOnChain.Public}
      keyQuoteFounder="Quotes are like boats"
      pledgedAmount={10007584930223}
      investorsCount={5}
      isInvestor={true}
      isVerifiedInvestor={true}
      pledge={{ amountEur: 999, currency: ECurrency.EUR_TOKEN, consentToRevealEmail: true }}
    />
  ))
  .add("Active, non-verified-investor view", () => (
    <CampaigningActivatedWidgetComponent
      whitelistingState={EWhitelistingState.ACTIVE}
      countdownDate={undefined}
      etoId="test"
      investorsLimit={500}
      minPledge={10}
      nextState={EETOStateOnChain.Public}
      keyQuoteFounder="Quotes are like boats"
      pledgedAmount={10007584930223}
      investorsCount={1}
      isInvestor={true}
      isVerifiedInvestor={false}
    />
  ))
  .add("Active, non-investor view", () => (
    <CampaigningActivatedWidgetComponent
      whitelistingState={EWhitelistingState.ACTIVE}
      countdownDate={undefined}
      etoId="test"
      investorsLimit={500}
      minPledge={10}
      nextState={EETOStateOnChain.Public}
      keyQuoteFounder="Quotes are like boats"
      pledgedAmount={10007584930223}
      investorsCount={1}
      isInvestor={false}
      isVerifiedInvestor={false}
    />
  ))
  .add("Suspended, is verified investor, has pledged", () => (
    <CampaigningActivatedWidgetComponent
      whitelistingState={EWhitelistingState.SUSPENDED}
      countdownDate={undefined}
      etoId="test"
      investorsLimit={500}
      minPledge={10}
      nextState={EETOStateOnChain.Public}
      keyQuoteFounder="Quotes are like boats"
      pledgedAmount={10007584930223}
      investorsCount={8}
      isInvestor={true}
      isVerifiedInvestor={true}
      pledge={{ amountEur: 999, currency: ECurrency.EUR_TOKEN, consentToRevealEmail: true }}
    />
  ))
  .add("Suspended, is verified investor, has not pledged", () => (
    <CampaigningActivatedWidgetComponent
      whitelistingState={EWhitelistingState.SUSPENDED}
      countdownDate={undefined}
      etoId="test"
      investorsLimit={500}
      minPledge={10}
      nextState={EETOStateOnChain.Public}
      keyQuoteFounder="Quotes are like boats"
      pledgedAmount={10007584930223}
      investorsCount={8}
      isInvestor={true}
      isVerifiedInvestor={true}
      pledge={undefined}
    />
  ))
  .add("Suspended, is investor, is not a verified investor", () => (
    <CampaigningActivatedWidgetComponent
      whitelistingState={EWhitelistingState.SUSPENDED}
      countdownDate={undefined}
      etoId="test"
      investorsLimit={500}
      minPledge={10}
      nextState={EETOStateOnChain.Public}
      keyQuoteFounder="Quotes are like boats"
      pledgedAmount={10007584930223}
      investorsCount={8}
      isInvestor={true}
      isVerifiedInvestor={false}
    />
  ))
  .add("Suspended, is not an investor", () => (
    <CampaigningActivatedWidgetComponent
      whitelistingState={EWhitelistingState.SUSPENDED}
      countdownDate={undefined}
      etoId="test"
      investorsLimit={500}
      minPledge={10}
      nextState={EETOStateOnChain.Public}
      keyQuoteFounder="Quotes are like boats"
      pledgedAmount={10007584930223}
      investorsCount={8}
      isInvestor={false}
      isVerifiedInvestor={false}
    />
  ))
  .add("NotActive, is verified investor", () => (
    <CampaigningActivatedWidgetComponent
      whitelistingState={EWhitelistingState.NOT_ACTIVE}
      countdownDate={undefined}
      etoId="test"
      investorsLimit={500}
      minPledge={10}
      nextState={EETOStateOnChain.Public}
      keyQuoteFounder="Quotes are like boats"
      pledgedAmount={0}
      investorsCount={1}
      isInvestor={true}
      isVerifiedInvestor={true}
    />
  ))
  .add("NotActive, not an investor", () => (
    <CampaigningActivatedWidgetComponent
      whitelistingState={EWhitelistingState.NOT_ACTIVE}
      countdownDate={undefined}
      etoId="test"
      investorsLimit={500}
      minPledge={10}
      nextState={EETOStateOnChain.Public}
      keyQuoteFounder="Quotes are like boats"
      pledgedAmount={0}
      investorsCount={1}
      isInvestor={false}
      isVerifiedInvestor={false}
    />
  ))
  .add("Investor Limit Reached, is verified investor, has pledged, next start date not set", () => (
    <CampaigningActivatedWidgetComponent
      whitelistingState={EWhitelistingState.LIMIT_REACHED}
      countdownDate={undefined}
      etoId="test"
      investorsLimit={500}
      minPledge={10}
      nextState={EETOStateOnChain.Public}
      keyQuoteFounder="Quotes are like boats"
      pledgedAmount={10007584930223}
      investorsCount={18}
      isInvestor={true}
      isVerifiedInvestor={true}
      pledge={{ amountEur: 999, currency: ECurrency.EUR_TOKEN, consentToRevealEmail: true }}
    />
  ))
  .add(
    "Investor Limit Reached, is verified investor, has not pledged, next start date not set",
    () => (
      <CampaigningActivatedWidgetComponent
        whitelistingState={EWhitelistingState.LIMIT_REACHED}
        countdownDate={undefined}
        etoId="test"
        investorsLimit={500}
        minPledge={10}
        nextState={EETOStateOnChain.Public}
        keyQuoteFounder="Quotes are like boats"
        pledgedAmount={10007584930223}
        investorsCount={1}
        isInvestor={true}
        isVerifiedInvestor={true}
      />
    ),
  )
  .add(
    "Investor Limit Reached, is investor, is not a verified investor, next start date not set",
    () => (
      <CampaigningActivatedWidgetComponent
        whitelistingState={EWhitelistingState.LIMIT_REACHED}
        countdownDate={undefined}
        etoId="test"
        investorsLimit={500}
        minPledge={10}
        nextState={EETOStateOnChain.Public}
        keyQuoteFounder="Quotes are like boats"
        pledgedAmount={10007584930223}
        investorsCount={1}
        isInvestor={true}
        isVerifiedInvestor={false}
      />
    ),
  )
  .add("Investor Limit Reached, is not an investor, next start date not set", () => (
    <CampaigningActivatedWidgetComponent
      whitelistingState={EWhitelistingState.LIMIT_REACHED}
      countdownDate={undefined}
      etoId="test"
      investorsLimit={500}
      minPledge={10}
      nextState={EETOStateOnChain.Public}
      keyQuoteFounder="Quotes are like boats"
      pledgedAmount={10007584930223}
      investorsCount={12}
      isInvestor={false}
      isVerifiedInvestor={false}
    />
  ))
  .add("Investor Limit Reached, Start date is set, is verified investor", () => (
    <CampaigningActivatedWidgetComponent
      whitelistingState={EWhitelistingState.LIMIT_REACHED}
      etoId="test"
      investorsLimit={500}
      minPledge={10}
      nextState={EETOStateOnChain.Public}
      countdownDate={moment()
        .add(3, "day")
        .toDate()}
      keyQuoteFounder="Quotes are like boats"
      pledgedAmount={10007584930223}
      investorsCount={12}
      isInvestor={true}
      isVerifiedInvestor={true}
      pledge={{ amountEur: 999, currency: ECurrency.EUR_TOKEN, consentToRevealEmail: true }}
    />
  ))
  .add("Investor Limit Reached, Start date is set, is investor, not a verified investor", () => (
    <CampaigningActivatedWidgetComponent
      whitelistingState={EWhitelistingState.LIMIT_REACHED}
      etoId="test"
      investorsLimit={500}
      minPledge={10}
      nextState={EETOStateOnChain.Public}
      countdownDate={moment()
        .add(3, "day")
        .toDate()}
      keyQuoteFounder="Quotes are like boats"
      pledgedAmount={10007584930223}
      investorsCount={1}
      isInvestor={true}
      isVerifiedInvestor={false}
    />
  ))
  .add("Investor Limit Reached, Start date is set, is not an investor", () => (
    <CampaigningActivatedWidgetComponent
      whitelistingState={EWhitelistingState.LIMIT_REACHED}
      etoId="test"
      investorsLimit={500}
      minPledge={10}
      nextState={EETOStateOnChain.Public}
      countdownDate={moment()
        .add(3, "day")
        .toDate()}
      keyQuoteFounder="Quotes are like boats"
      pledgedAmount={10007584930223}
      investorsCount={1}
      isInvestor={false}
      isVerifiedInvestor={false}
    />
  ));
