import * as React from "react";
import { branch, compose, renderComponent } from "recompose";

import { actions } from "../../modules/actions";
import {
  selectNomineeStateIsLoading,
  selectNomineeTaskStep,
} from "../../modules/nominee-flow/selectors";
import { ENomineeTask } from "../../modules/nominee-flow/types";
import { appConnect } from "../../store";
import { TTranslatedString } from "../../types";
import { onEnterAction } from "../../utils/OnEnterAction";
import { withContainer } from "../../utils/withContainer.unsafe";
import { Layout } from "../layouts/Layout";
import { LoadingIndicator } from "../shared/loading-indicator/LoadingIndicator";
import { NomineeDashboardTasks } from "./NomineeDashboardTasks";

import * as styles from "./NomineeDashboard.module.scss";

interface IStateProps {
  nomineeTaskStep: ENomineeTask;
  isLoading: boolean;
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

export const NomineeDashboard = compose<Omit<IStateProps, "isLoading">, {}>(
  withContainer(Layout),
  appConnect<IStateProps>({
    stateToProps: state => ({
      isLoading: selectNomineeStateIsLoading(state),
      nomineeTaskStep: selectNomineeTaskStep(state),
    }),
  }),
  onEnterAction({
    actionCreator: dispatch => {
      dispatch(actions.nomineeFlow.loadNomineeTaskData());
    },
  }),
  branch<IStateProps>(props => props.isLoading, renderComponent(LoadingIndicator)),
)(NomineeDashboardTasks);
