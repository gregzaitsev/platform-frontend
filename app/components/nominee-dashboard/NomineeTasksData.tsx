import * as React from "react";

import { TEtoWithCompanyAndContract } from "../../modules/eto/types";
import { AcceptIsha } from "./AcceptIsha";
import { AcceptTha } from "./AcceptTha";
import { AccountSetup } from "./accountSetup/AccountSetup";
import { LinkBankAccount } from "./LinkBankAccount";
import { LinkToIssuer } from "./linkToIssuer/LinkToIssuer";
import { NoTasks } from "./NoTasks";
import { RedeemShareCapital } from "./RedeemShareCapital";

export interface ITaskData {
  key: ENomineeTask;
  taskRootComponent: React.ComponentType;
}

export interface ITask {
  key: ENomineeTask;
  taskRootComponent: React.ComponentType;
}

export enum ENomineeTask {
  NONE = "noTasks",
  ACCOUNT_SETUP = "accountSetup",
  LINK_TO_ISSUER = "linkToIssuer",
  LINK_BANK_ACCOUNT = "linkBankAccount",
  ACCEPT_THA = "acceptTha",
  REDEEM_SHARE_CAPITAL = "redeemShareCapital",
  ACCEPT_ISHA = "acceptIsha",
}

type TNomineeTasksData = { [key in ENomineeTask]: ITaskData };

export const NomineeTasksData: TNomineeTasksData = {
  [ENomineeTask.ACCOUNT_SETUP]: {
    key: ENomineeTask.ACCOUNT_SETUP,
    taskRootComponent: AccountSetup,
  },
  [ENomineeTask.LINK_TO_ISSUER]: {
    key: ENomineeTask.LINK_TO_ISSUER,
    taskRootComponent: LinkToIssuer,
  },
  [ENomineeTask.LINK_BANK_ACCOUNT]: {
    key: ENomineeTask.LINK_BANK_ACCOUNT,
    taskRootComponent: LinkBankAccount,
  },
  [ENomineeTask.ACCEPT_THA]: {
    key: ENomineeTask.ACCEPT_THA,
    taskRootComponent: AcceptTha,
  },
  [ENomineeTask.REDEEM_SHARE_CAPITAL]: {
    key: ENomineeTask.REDEEM_SHARE_CAPITAL,
    taskRootComponent: RedeemShareCapital,
  },
  [ENomineeTask.ACCEPT_ISHA]: {
    key: ENomineeTask.ACCEPT_ISHA,
    taskRootComponent: AcceptIsha,
  },
  [ENomineeTask.NONE]: {
    key: ENomineeTask.NONE,
    taskRootComponent: NoTasks,
  },
};

//todo here all task choosing logic
export const getNomineeTaskStep = (
  verificationIsComplete: boolean,
  nomineeEto: TEtoWithCompanyAndContract | undefined,
  isBankAccountVerified: boolean,
): ENomineeTask => {
  if (!verificationIsComplete) {
    return ENomineeTask.ACCOUNT_SETUP;
  } else if (nomineeEto === undefined) {
    return ENomineeTask.LINK_TO_ISSUER;
  } else if (!isBankAccountVerified) {
    return ENomineeTask.LINK_BANK_ACCOUNT;
  } else {
    return ENomineeTask.NONE;
  }
};

export const getNomineeTasks = (data: TNomineeTasksData, step: ENomineeTask) => [
  data[step] as ITask,
];
