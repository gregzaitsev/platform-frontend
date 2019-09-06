import * as React from "react";
import { FormattedMessage } from "react-intl-phraseapp";

import { EETOStateOnChain, TEtoWithCompanyAndContract } from "../../../modules/eto/types";
import { isOnChain } from "../../../modules/eto/utils";
import { icoMonitorEtoLink } from "../../appRouteUtils";
import { Container, EColumnSpan } from "../../layouts/Container";
import { ButtonLink } from "../../shared/buttons";
import { Panel } from "../../shared/Panel";
import { EtoTimeline } from "../overview/EtoTimeline/EtoTimeline";
import { DashboardHeading } from "../shared/DashboardHeading";

import * as styles from "./ETOTimeline.module.scss";

const ETOTimeline: React.FunctionComponent<{ eto: TEtoWithCompanyAndContract }> = ({ eto }) => {
  const mayShowFundraisingStatsLink =
    process.env.NF_MAY_SHOW_INVESTOR_STATS === "1" &&
    isOnChain(eto) &&
    eto.contract.timedState !== EETOStateOnChain.Setup;

  return (
    <Container columnSpan={EColumnSpan.THREE_COL}>
      <DashboardHeading
        title={
          <div className={styles.headerWithButton}>
            <FormattedMessage id="eto.public-view.eto-timeline" />
            {mayShowFundraisingStatsLink && (
              <ButtonLink
                to={icoMonitorEtoLink(eto.etoId)}
                target="_blank"
                data-test-id="fundraising-statistics-button"
              >
                <FormattedMessage id="eto.public-view.fundraising-statistics-button" />
              </ButtonLink>
            )}
          </div>
        }
      />
      <Panel>
        <EtoTimeline
          state={eto.state}
          subState={eto.subState}
          currentState={isOnChain(eto) ? eto.contract.timedState : undefined}
          startOfStates={isOnChain(eto) ? eto.contract.startOfStates : undefined}
        />
      </Panel>
    </Container>
  );
};

export { ETOTimeline };
