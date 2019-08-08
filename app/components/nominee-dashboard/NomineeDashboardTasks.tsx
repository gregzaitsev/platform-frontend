import * as React from "react";
import { compose, withProps } from "recompose";

import { getNomineeTasks, ITask, NomineeFlowData } from "./NomineeFlowData";
import { ENomineeFlowStep } from "../../modules/nominee-flow/reducer";

interface IDashboardProps {
  nomineeTasks: ITask[];
}

interface IExternalProps {
  nomineeFlowStep: ENomineeFlowStep;
}

const NomineeDashboardTasksLayout: React.FunctionComponent<IDashboardProps> = ({
  nomineeTasks,
}) => (
  <>
    {nomineeTasks.map(({ taskRootComponent: TaskRootComponent, key }: ITask) => (
      <TaskRootComponent key={key} />
    ))}
  </>
);

export const NomineeDashboardTasks = compose<IDashboardProps, IExternalProps>(
  withProps<IDashboardProps, IExternalProps>(({ nomineeFlowStep }) => ({
    nomineeTasks: getNomineeTasks(NomineeFlowData, nomineeFlowStep),
  })),
)(NomineeDashboardTasksLayout);
