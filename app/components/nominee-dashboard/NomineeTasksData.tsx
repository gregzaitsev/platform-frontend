import * as React from "react";
import { ConnectToIssuer } from "./ConnectToIssuer";

export interface ITaskData {
  key: ENomineeTask;
  taskRootComponent: React.ComponentClass
}

export interface ITask {
  key: ENomineeTask;
  taskRootComponent: React.ComponentClass
}

export enum ENomineeTask {
  CONNECT_TO_ISSUER = "connectToIssuer",
  ACCEPT_THA = "acceptTha",
  REDEEM_SHARE_CAPITAL = "redeemShareCapital",
  ACCEPT_ISHA = "acceptIsha"
}

type TNomineeTasksData = { [key in ENomineeTask]: ITaskData }

export const NomineeTasksData: TNomineeTasksData = {
  [ENomineeTask.CONNECT_TO_ISSUER]: {
    key: ENomineeTask.CONNECT_TO_ISSUER,
    taskRootComponent: ConnectToIssuer
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
  return [data[ENomineeTask.CONNECT_TO_ISSUER] as ITask]
};
