import * as React from "react";
import {  compose, nest, withProps } from "recompose";

import { actions } from "../../modules/actions";
import { selectIsBankAccountVerified } from "../../modules/bank-transfer-flow/selectors";
import { INomineeRequest } from "../../modules/nominee-flow/reducer";
import {
  selectNomineeRequests,
  selectNomineeStateIsLoading,
} from "../../modules/nominee-flow/selectors";
import { takeLatestNomineeRequest } from "../../modules/nominee-flow/utils";
import { SelectIsVerificationFullyDone } from "../../modules/selectors";
import { appConnect } from "../../store";
import { TTranslatedString } from "../../types";
import { onEnterAction } from "../../utils/OnEnterAction";
import { withContainer } from "../../utils/withContainer.unsafe";
import { Layout } from "../layouts/Layout";
import { NomineeDashboardContainer } from "./NomineeDashboardContainer";
import { ENomineeTask, getNomineeTaskStep } from "./NomineeTasksData";
import { NomineeDashboardTasks } from "./NomineeDashboardTasks";

import * as styles from "./NomineeDashboard.module.scss";

interface IStateProps {
  verificationIsComplete: boolean;
  isLoading: boolean;
  isBankAccountVerified: boolean;
  nomineeRequest: INomineeRequest | undefined;
}

interface IDashboardProps {
  nomineeTaskStep: ENomineeTask;
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
      nomineeRequest: takeLatestNomineeRequest(selectNomineeRequests(state)), //only take the latest one for now
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
  withProps<IDashboardProps, IStateProps>(({ verificationIsComplete, nomineeRequest, isBankAccountVerified }) =>
    ({
      nomineeTaskStep: getNomineeTaskStep(verificationIsComplete, nomineeRequest, isBankAccountVerified)
    })
  ),
  withContainer<IDashboardProps>(nest(Layout, NomineeDashboardContainer)),
)(NomineeDashboardTasks);
