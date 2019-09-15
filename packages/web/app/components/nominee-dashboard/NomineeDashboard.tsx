import { branch, compose, renderComponent } from "recompose";

import { actions } from "../../modules/actions";
import {
  selectNomineeStateIsLoading,
  selectNomineeTaskStep,
} from "../../modules/nominee-flow/selectors";
import { ENomineeTask } from "../../modules/nominee-flow/types";
import { appConnect } from "../../store";
import { onEnterAction } from "../../utils/OnEnterAction";
import { withContainer } from "../../utils/withContainer.unsafe";
import { Layout } from "../layouts/Layout";
import { LoadingIndicator } from "../shared/loading-indicator/LoadingIndicator";
import { NomineeDashboardTasks } from "./NomineeDashboardTasks";

interface IStateProps {
  nomineeTaskStep: ENomineeTask;
  isLoading: boolean;
}

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
