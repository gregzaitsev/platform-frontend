import * as React from "react";
import { FormattedMessage } from "react-intl-phraseapp";
import { branch, compose, nest, renderComponent, withProps } from "recompose";

import { SelectIsVerificationFullyDone } from "../../modules/selectors";
import { appConnect } from "../../store";
import { TTranslatedString } from "../../types";
import { withContainer } from "../../utils/withContainer.unsafe";
import { Layout } from "../layouts/Layout";
import { Panel } from "../shared/Panel";
import { SuccessTick } from "../shared/SuccessTick";
import { NomineeAccountSetup } from "./NomineeAccountSetup";
import { getNomineeTasks, ITask, NomineeTasksData } from "./NomineeTasksData";
import { onEnterAction } from "../../utils/OnEnterAction";
import { actions } from "../../modules/actions";
import { selectNomineeRequests, selectNomineeStateIsLoading } from "../../modules/nominee-flow/selectors";
import { LoadingIndicator } from "../shared/loading-indicator/LoadingIndicator";
import {  INomineeRequest } from "../../modules/nominee-flow/reducer";

import * as styles from "./NomineeDashboard.module.scss";
import { takeLatestNomineeRequest } from "../../modules/nominee-flow/utils";

interface IStateProps {
  verificationIsComplete: boolean;
  isLoading: boolean;
  nomineeRequest: INomineeRequest | undefined;
}

interface IDashboardProps {
  nomineeTasks: ITask[];
}

export const NomineeDashboardContainer: React.FunctionComponent = ({ children }) => (
  <div data-test-id="nominee-dashboard" className={styles.nomineeDashboardContainer}>
    {children}
  </div>
);

interface IDashboardTitleProps {
  title: TTranslatedString;
  text: TTranslatedString;
}

export const DashboardTitle: React.FunctionComponent<IDashboardTitleProps> = ({ title, text }) => (
  <div className={styles.dashboardTitleWrapper}>
    <h1 className={styles.dashboardTitle}>{title}</h1>
    <p className={styles.dashboardText}>{text}</p>
  </div>
);

const NoTasks = () => (
  <>
    <SuccessTick />
    <h2 className={styles.dashboardTitle}>
      <FormattedMessage id="nominee-dashboard.no-tasks-title" />
    </h2>
    <p className={styles.dashboardText}>
      <FormattedMessage id="nominee-dashboard.no-tasks-text" />
    </p>
  </>
);

const NomineeTasks: React.FunctionComponent<any> = ({ tasks }) => {
  return tasks.map((task: ITask) => <task.taskRootComponent key={task.key}/>)
};

export const NomineeDashboardTasks: React.FunctionComponent<IDashboardProps> = ({
  nomineeTasks,
}) => (
  <Panel className={styles.dashboardContentPanel}>
    {nomineeTasks.length ? <NomineeTasks tasks={nomineeTasks} /> : <NoTasks />}
  </Panel>
);

export const NomineeDashboard = compose<IDashboardProps, {}>(
  withContainer(nest(Layout, NomineeDashboardContainer)),
  appConnect<IStateProps>({
    stateToProps: state => ({
      isLoading: selectNomineeStateIsLoading(state),
      nomineeRequest: takeLatestNomineeRequest(selectNomineeRequests(state)),//only take the latest one for now
      verificationIsComplete: SelectIsVerificationFullyDone(state),
    })
  }),
  // fixme add watcher to renew verificationIsComplete!!
  branch<IStateProps>(({ verificationIsComplete }) => !verificationIsComplete, renderComponent(NomineeAccountSetup)),
  onEnterAction({
    actionCreator:dispatch => dispatch(actions.nomineeFlow.loadNomineeTaskData())
  }),
  branch<IStateProps>(({isLoading}) => isLoading, renderComponent(LoadingIndicator)),
  withProps<IDashboardProps, IStateProps>(({nomineeRequest}) => ({
    nomineeTasks: getNomineeTasks(NomineeTasksData, nomineeRequest),
  }))
)(NomineeDashboardTasks);
