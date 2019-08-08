import * as React from "react";

import { ENomineeTask } from "../NomineeTasksData";
import { AccountSetupContainer } from "./AccountSetupContainer";
import { LinkedNomineeDashboardContainer } from "./LinkedNomineeDashboardContainer";
import { NotLinkedNomineeDashboardContainer } from "./NotLinkedNomineeDashboardContainer";

interface IExternalProps {
  nomineeTaskStep: ENomineeTask;
}

const NomineeDashboardContainer: React.FunctionComponent<IExternalProps> = ({
  nomineeTaskStep,
  children,
}) => {
  switch (nomineeTaskStep) {
    case ENomineeTask.ACCOUNT_SETUP:
      return <AccountSetupContainer children={children} />;
    case ENomineeTask.LINK_BANK_ACCOUNT:
    case ENomineeTask.ACCEPT_THA:
    case ENomineeTask.REDEEM_SHARE_CAPITAL:
    case ENomineeTask.ACCEPT_ISHA:
      return <LinkedNomineeDashboardContainer children={children} />;
    case ENomineeTask.LINK_TO_ISSUER:
    case ENomineeTask.NONE:
    default:
      return <NotLinkedNomineeDashboardContainer children={children} />;
  }
};

export { NomineeDashboardContainer };
