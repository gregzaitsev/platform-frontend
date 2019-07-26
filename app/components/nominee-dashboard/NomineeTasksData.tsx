import * as React from "react";
import { LinkToIssuer } from "./LinkToIssuer";

export interface ITaskData {
  key: ENomineeTask;
  taskRootComponent: React.ComponentClass
}

export interface ITask {
  key: ENomineeTask;
  taskRootComponent: React.ComponentClass
}

export enum ENomineeTask {
  LINK_TO_ISSUER = "linkToIssuer",
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
  [ENomineeTask.ACCEPT_THA]: {
    key: ENomineeTask.ACCEPT_THA,
    taskRootComponent: () =><>{ENomineeTask.ACCEPT_THA}</>
  },
  [ENomineeTask.REDEEM_SHARE_CAPITAL]: {
    key: ENomineeTask.REDEEM_SHARE_CAPITAL,
    taskRootComponent: <>{ENomineeTask.REDEEM_SHARE_CAPITAL}</>
  },
  [ENomineeTask.ACCEPT_ISHA]: {
    key: ENomineeTask.ACCEPT_ISHA,
    taskRootComponent: () =><>{ENomineeTask.ACCEPT_ISHA}</>
  }
};
//todo here all task choosing logic
export const getNomineeTasks = (data: TNomineeTasksData):ITask[] => {
  return [data[ENomineeTask.LINK_TO_ISSUER] as ITask]
};
