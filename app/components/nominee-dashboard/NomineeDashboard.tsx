import * as React from "react";
import { FormattedMessage } from "react-intl-phraseapp";
import { branch, compose, nest, renderComponent, withProps } from "recompose";

import { actions } from "../../modules/actions";
import { selectIsBankAccountVerified } from "../../modules/bank-transfer-flow/selectors";
import {  INomineeRequest } from "../../modules/nominee-flow/reducer";
import { selectNomineeRequests, selectNomineeStateIsLoading } from "../../modules/nominee-flow/selectors";
import { takeLatestNomineeRequest } from "../../modules/nominee-flow/utils";
import { SelectIsVerificationFullyDone } from "../../modules/selectors";
import { appConnect } from "../../store";
import { TTranslatedString } from "../../types";
import { onEnterAction } from "../../utils/OnEnterAction";
import { withContainer } from "../../utils/withContainer.unsafe";
import { Layout } from "../layouts/Layout";
import { LoadingIndicator } from "../shared/loading-indicator/LoadingIndicator";
import { SuccessTick } from "../shared/SuccessTick";
import { NomineeAccountSetup } from "./NomineeAccountSetup";
import { NomineeDashboardContainer } from "./NomineeDashboardContainer";
import { getNomineeTasks, ITask, NomineeTasksData } from "./NomineeTasksData";

import * as styles from "./NomineeDashboard.module.scss";

interface IStateProps {
  verificationIsComplete: boolean;
  isLoading: boolean;
  isBankAccountVerified: boolean;
  nomineeRequest: INomineeRequest | undefined;
}

interface IDashboardProps {
  nomineeTasks: ITask[];
}



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

const NomineeTasks: React.FunctionComponent<any> = ({ tasks }) =>
  tasks.map((task: ITask) => <task.taskRootComponent key={task.key}/>);

export const NomineeDashboardTasks: React.FunctionComponent<IDashboardProps> = ({
  nomineeTasks,
}) => (
  <section className={styles.dashboardContentPanel}>
    {nomineeTasks.length ? <NomineeTasks tasks={nomineeTasks} /> : <NoTasks />}
  </section>
);

export const NomineeDashboard = compose<IDashboardProps, {}>(
  withContainer(nest(Layout, NomineeDashboardContainer)),
  appConnect<IStateProps>({
    stateToProps: state => ({
      isLoading: selectNomineeStateIsLoading(state),
      nomineeRequest: takeLatestNomineeRequest(selectNomineeRequests(state)),//only take the latest one for now
      isBankAccountVerified: selectIsBankAccountVerified(state),
      verificationIsComplete: SelectIsVerificationFullyDone(state),
    })
  }),
  // fixme add watcher to renew verificationIsComplete!!
  branch<IStateProps>(({ verificationIsComplete }) => !verificationIsComplete, renderComponent(NomineeAccountSetup)),
  onEnterAction({
    actionCreator:dispatch => {
      dispatch(actions.nomineeFlow.loadNomineeTaskData());
        //for the case that it was started in the NomineeKycPending branch
      dispatch(actions.kyc.kycStopWatching());
    }
  }),
  branch<IStateProps>(({isLoading}) => isLoading, renderComponent(LoadingIndicator)),
  withProps<IDashboardProps, IStateProps>(({nomineeRequest,isBankAccountVerified}) => ({
    nomineeTasks: getNomineeTasks(NomineeTasksData, nomineeRequest, isBankAccountVerified),
  }))
)(NomineeDashboardTasks);
