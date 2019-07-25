import * as React from "react";
import { FormattedMessage } from "react-intl-phraseapp";
import { branch, compose, nest, renderComponent } from "recompose";

import { SelectIsVerificationFullyDone } from "../../modules/selectors";
import { appConnect } from "../../store";
import { TTranslatedString } from "../../types";
import { withContainer } from "../../utils/withContainer.unsafe";
import { Layout } from "../layouts/Layout";
import { Panel } from "../shared/Panel";
import { SuccessTick } from "../shared/SuccessTick";

import * as styles from "./NomineeDashboard.module.scss";
import { NomineeAccountSetup } from "./NomineeAccountSetup";

interface IStateProps {
  verificationIsComplete: boolean;
  nomineeTasks: INomineeTask[];
}

interface INomineeTask {
  key: string;
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

export const NomineeDashboardTasks: React.FunctionComponent<IStateProps> = ({
  nomineeTasks,
}) => (
  <Panel className={styles.dashboardContentPanel}>
    {nomineeTasks.length ? () => <>tasks</> : <NoTasks /> }
  </Panel>
);

export const NomineeDashboard = compose<IStateProps, {}>(
  withContainer(nest(Layout, NomineeDashboardContainer)),
  appConnect<IStateProps>({
    stateToProps: state => ({
      nomineeTasks: [],
      verificationIsComplete: SelectIsVerificationFullyDone(state),
    })
  }),
  // fixme add watcher to renew verificationIsComplete!!
  branch<IStateProps>(({verificationIsComplete}) => !verificationIsComplete, renderComponent(NomineeAccountSetup) )
)(NomineeDashboardTasks);
