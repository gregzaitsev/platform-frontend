import * as React from "react";

export interface ITaskData {
  key: ENomineeTask;
  taskFlow: React.ReactElement
}

export interface ITask {
  key: ENomineeTask;
  taskFlow: React.ReactElement
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
    taskFlow: <>{ENomineeTask.CONNECT_TO_ISSUER}</>
  },
  [ENomineeTask.ACCEPT_THA]: {
    key: ENomineeTask.ACCEPT_THA,
    taskFlow: <>{ENomineeTask.ACCEPT_THA}</>
  },
  [ENomineeTask.REDEEM_SHARE_CAPITAL]: {
    key: ENomineeTask.REDEEM_SHARE_CAPITAL,
    taskFlow: <>{ENomineeTask.REDEEM_SHARE_CAPITAL}</>
  },
  [ENomineeTask.ACCEPT_ISHA]: {
    key: ENomineeTask.ACCEPT_ISHA,
    taskFlow: <>{ENomineeTask.ACCEPT_ISHA}</>
  }
};

export const getNomineeTasks = (data: TNomineeTasksData):ITask[] => {
  return [data[ENomineeTask.CONNECT_TO_ISSUER] as ITask]
};
