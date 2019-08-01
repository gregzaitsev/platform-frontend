import * as React from "react";

import { LinkToIssuer } from "./LinkToIssuer";
import { AcceptTha } from "./AcceptTha";
import { RedeemShareCapital } from "./RedeemShareCapital";
import { AcceptIsha } from "./AcceptIsha";
import { ENomineeRequestStatus, INomineeRequest } from "../../modules/nominee-flow/reducer";
import { LinkBankAccount } from "./LinkBankAccount";

export interface ITaskData {
  key: ENomineeTask;
  taskRootComponent: React.ComponentType,
}

export interface ITask {
  key: ENomineeTask;
  taskRootComponent: React.ComponentType
}

export enum ENomineeTask {
  LINK_TO_ISSUER = "linkToIssuer",
  LINK_BANK_ACCOUNT = "linkBankAccount",
  ACCEPT_THA = "acceptTha",
  REDEEM_SHARE_CAPITAL = "redeemShareCapital",
  ACCEPT_ISHA = "acceptIsha"
}

type TNomineeTasksData = { [key in ENomineeTask]: ITaskData }

export const NomineeTasksData: TNomineeTasksData = {
  [ENomineeTask.LINK_TO_ISSUER]: {
    key: ENomineeTask.LINK_TO_ISSUER,
    taskRootComponent: LinkToIssuer
  },
  [ENomineeTask.LINK_BANK_ACCOUNT]: {
    key: ENomineeTask.LINK_BANK_ACCOUNT,
    taskRootComponent: LinkBankAccount
  },
  [ENomineeTask.ACCEPT_THA]: {
    key: ENomineeTask.ACCEPT_THA,
    taskRootComponent: AcceptTha
  },
  [ENomineeTask.REDEEM_SHARE_CAPITAL]: {
    key: ENomineeTask.REDEEM_SHARE_CAPITAL,
    taskRootComponent: RedeemShareCapital
  },
  [ENomineeTask.ACCEPT_ISHA]: {
    key: ENomineeTask.ACCEPT_ISHA,
    taskRootComponent: AcceptIsha
  }
};

//todo here all task choosing logic
export const getNomineeTasks = (
  data: TNomineeTasksData,
  nomineeRequest: INomineeRequest | undefined,
  isBankAccountVerified: boolean
):ITask[] => {
  console.log("nomineeRequest", nomineeRequest && nomineeRequest.state,"isBankAccountVerified",isBankAccountVerified)
  if(!nomineeRequest ||nomineeRequest.state !== ENomineeRequestStatus.APPROVED){
    return [data[ENomineeTask.LINK_TO_ISSUER] as ITask]
  } else if(!isBankAccountVerified) {
    return [data[ENomineeTask.LINK_BANK_ACCOUNT] as ITask]
  }
  else {
    return []
  }
};
