import * as React from "react";

import { TEtoWithCompanyAndContract } from "../../modules/eto/types";
import { AcceptIsha } from "./AcceptIsha";
import { AcceptTha } from "./AcceptTha";
import { AccountSetup } from "./accountSetup/AccountSetup";
import { LinkBankAccount } from "./LinkBankAccount";
import { LinkToIssuer } from "./linkToIssuer/LinkToIssuer";
import { NoTasks } from "./NoTasks";
import { RedeemShareCapital } from "./RedeemShareCapital";
import { ENomineeFlowStep } from "../../modules/nominee-flow/reducer";

export interface ITaskData {
  key: ENomineeFlowStep;
  taskRootComponent: React.ComponentType;
}

export interface ITask {
  key: ENomineeFlowStep;
  taskRootComponent: React.ComponentType;
}

type TNomineeTasksData = { [key in ENomineeFlowStep]: ITaskData };

export const NomineeFlowData: TNomineeTasksData = {
  [ENomineeFlowStep.ACCOUNT_SETUP]: {
    key: ENomineeFlowStep.ACCOUNT_SETUP,
    taskRootComponent: AccountSetup,
  },
  [ENomineeFlowStep.LINK_TO_ISSUER]: {
    key: ENomineeFlowStep.LINK_TO_ISSUER,
    taskRootComponent: LinkToIssuer,
  },
  [ENomineeFlowStep.LINK_BANK_ACCOUNT]: {
    key: ENomineeFlowStep.LINK_BANK_ACCOUNT,
    taskRootComponent: LinkBankAccount,
  },
  [ENomineeFlowStep.ACCEPT_THA]: {
    key: ENomineeFlowStep.ACCEPT_THA,
    taskRootComponent: AcceptTha,
  },
  [ENomineeFlowStep.REDEEM_SHARE_CAPITAL]: {
    key: ENomineeFlowStep.REDEEM_SHARE_CAPITAL,
    taskRootComponent: RedeemShareCapital,
  },
  [ENomineeFlowStep.ACCEPT_ISHA]: {
    key: ENomineeFlowStep.ACCEPT_ISHA,
    taskRootComponent: AcceptIsha,
  },
  [ENomineeFlowStep.NONE]: {
    key: ENomineeFlowStep.NONE,
    taskRootComponent: NoTasks,
  },
};

//todo here all task choosing logic
export const getNomineeTaskStep = (
  verificationIsComplete: boolean,
  nomineeEto: TEtoWithCompanyAndContract | undefined,
  isBankAccountVerified: boolean,
): ENomineeFlowStep => {
  if (!verificationIsComplete) {
    return ENomineeFlowStep.ACCOUNT_SETUP;
  } else if (nomineeEto === undefined) {
    return ENomineeFlowStep.LINK_TO_ISSUER;
  } else if (!isBankAccountVerified) {
    return ENomineeFlowStep.LINK_BANK_ACCOUNT;
  } else {
    return ENomineeFlowStep.NONE;
  }
};

export const getNomineeTasks = (data: TNomineeTasksData, step: ENomineeFlowStep) => {
  console.log("getNomineeTasks",step);
  return [data[step]];
}
