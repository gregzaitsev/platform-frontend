import * as React from "react";
import { compose } from "recompose";

import { selectNomineeStateIsLoading } from "../../modules/nominee-flow/selectors";
import { appConnect } from "../../store";
import { TTranslatedString } from "../../types";
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
<<<<<<< HEAD:app/components/nominee-dashboard/NomineeDashboard.tsx
      nomineeFlowStep: selectNomineeFlowStep(state),
    })
=======
      nomineeEto: selectNomineeEto(state),
      isBankAccountVerified: selectIsBankAccountVerified(state),
      verificationIsComplete: SelectIsVerificationFullyDone(state),
    }),
  }),
  onEnterAction<IStateProps>({
    actionCreator: (dispatch, { verificationIsComplete }) => {
      if (verificationIsComplete) {
        dispatch(actions.nomineeFlow.loadNomineeTaskData());
      }
    },
  }),
  withProps<IDashboardProps, IStateProps>(
    ({ verificationIsComplete, nomineeEto, isBankAccountVerified }) => ({
      nomineeTaskStep: getNomineeTaskStep(
        verificationIsComplete,
        nomineeEto,
        isBankAccountVerified,
      ),
    }),
  ),
>>>>>>> a31da507cc0ce4613bff72071dc53d1d838ea0d0:packages/web/app/components/nominee-dashboard/NomineeDashboard.tsx
  withContainer<IDashboardProps>(nest(Layout, NomineeDashboardContainer)),
)(NomineeDashboardTasks);
