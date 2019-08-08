import * as React from "react";
import {  compose, nest } from "recompose";

import { selectNomineeFlowStep, selectNomineeStateIsLoading } from "../../modules/nominee-flow/selectors";
import { appConnect } from "../../store";
import { TTranslatedString } from "../../types";
import { withContainer } from "../../utils/withContainer.unsafe";
import { Layout } from "../layouts/Layout";
import { NomineeDashboardContainer } from "./nomineeDashboardContainer/NomineeDashboardContainer";
import { NomineeDashboardTasks } from "./NomineeDashboardTasks";

import * as styles from "./NomineeDashboard.module.scss";
import { ENomineeFlowStep } from "../../modules/nominee-flow/reducer";

interface IStateProps {
  isLoading: boolean;
  nomineeFlowStep: ENomineeFlowStep
}

interface IDashboardProps {
  nomineeFlowStep: ENomineeFlowStep;
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

export const NomineeDashboard = compose<IDashboardProps, {}>(
  appConnect<IStateProps>({
    stateToProps: state => ({
      isLoading: selectNomineeStateIsLoading(state),
      nomineeFlowStep: selectNomineeFlowStep(state),
    })
  }),
  withContainer<IDashboardProps>(nest(Layout, NomineeDashboardContainer)),
)(NomineeDashboardTasks);
