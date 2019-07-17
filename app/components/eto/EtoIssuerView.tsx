import { branch, compose, renderComponent } from "recompose";

import { actions } from "../../modules/actions";
import { selectIssuerEtoWithCompanyAndContract } from "../../modules/eto-flow/selectors";
import { TEtoWithCompanyAndContract } from "../../modules/eto/types";
import { appConnect } from "../../store";
import { onEnterAction } from "../../utils/OnEnterAction";
import { withContainer } from "../../utils/withContainer.unsafe";
import { Layout } from "../layouts/Layout";
import { createErrorBoundary } from "../shared/errorBoundary/ErrorBoundary.unsafe";
import { ErrorBoundaryLayout } from "../shared/errorBoundary/ErrorBoundaryLayout";
import { LoadingIndicator } from "../shared/loading-indicator";
import { EtoView } from "./shared/EtoView";

type TStateProps = {
  eto: TEtoWithCompanyAndContract | undefined;
  isInvestorView: boolean;
};

type TViewProps = {
  eto: TEtoWithCompanyAndContract;
  isInvestorView: boolean;
};

export const EtoIssuerView = compose<TViewProps, {}>(
  createErrorBoundary(ErrorBoundaryLayout),
  onEnterAction({
    actionCreator: dispatch => {
      dispatch(actions.etoFlow.loadIssuerEto());
    },
  }),
  appConnect<TStateProps>({
    stateToProps: state => ({
      eto: selectIssuerEtoWithCompanyAndContract(state),
      isInvestorView: false,
    }),
  }),
  withContainer(Layout),
  branch<TStateProps>(props => !props.eto, renderComponent(LoadingIndicator)),
)(EtoView);
