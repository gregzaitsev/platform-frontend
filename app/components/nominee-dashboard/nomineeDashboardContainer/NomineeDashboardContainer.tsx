import * as React from "react";

import { AccountSetupContainer } from "./AccountSetupContainer";
import { LinkedNomineeDashboardContainer } from "./LinkedNomineeDashboardContainer";
import { NotLinkedNomineeDashboardContainer } from "./NotLinkedNomineeDashboardContainer";
import { ENomineeFlowStep } from "../../../modules/nominee-flow/reducer";

interface IExternalProps {
  nomineeTaskStep: ENomineeFlowStep;
}

const NomineeDashboardContainer: React.FunctionComponent<IExternalProps> = ({
  nomineeTaskStep,
  children,
}) => {
  switch (nomineeTaskStep) {
    case ENomineeFlowStep.ACCOUNT_SETUP:
      return <AccountSetupContainer children={children} />;
    case ENomineeFlowStep.LINK_BANK_ACCOUNT:
    case ENomineeFlowStep.ACCEPT_THA:
    case ENomineeFlowStep.REDEEM_SHARE_CAPITAL:
    case ENomineeFlowStep.ACCEPT_ISHA:
      return <LinkedNomineeDashboardContainer children={children} />;
    case ENomineeFlowStep.LINK_TO_ISSUER:
    case ENomineeFlowStep.NONE:
    default:
      return <NotLinkedNomineeDashboardContainer children={children} />;
  }
};

export { NomineeDashboardContainer };
