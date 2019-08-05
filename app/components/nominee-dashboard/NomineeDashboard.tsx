import * as React from "react";
import { compose, nest, withProps } from "recompose";

import { actions } from "../../modules/actions";
import { selectIsBankAccountVerified } from "../../modules/bank-transfer-flow/selectors";
import { selectFirstEto } from "../../modules/eto/selectors";
import { TEtoWithCompanyAndContract } from "../../modules/eto/types";
import { selectNomineeStateIsLoading } from "../../modules/nominee-flow/selectors";
import { SelectIsVerificationFullyDone } from "../../modules/selectors";
import { appConnect } from "../../store";
import { TTranslatedString } from "../../types";
import { onEnterAction } from "../../utils/OnEnterAction";
import { withContainer } from "../../utils/withContainer.unsafe";
import { Layout } from "../layouts/Layout";
import { NomineeDashboardContainer } from "./NomineeDashboardContainer";
import { NomineeDashboardTasks } from "./NomineeDashboardTasks";
import { ENomineeTask, getNomineeTaskStep } from "./NomineeTasksData";

import * as styles from "./NomineeDashboard.module.scss";

interface IStateProps {
  verificationIsComplete: boolean;
  isLoading: boolean;
  isBankAccountVerified: boolean;
  nomineeEto: TEtoWithCompanyAndContract | undefined;
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
      nomineeEto: selectFirstEto(state),
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
  withContainer<IDashboardProps>(nest(Layout, NomineeDashboardContainer)),
)(NomineeDashboardTasks);
