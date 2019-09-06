import * as React from "react";
import { branch, compose, renderComponent, withProps } from "recompose";

import { actions } from "../../modules/actions";
import { selectNomineeEto } from "../../modules/eto/selectors";
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
};

type TViewProps = {
  eto: TEtoWithCompanyAndContract;
  publicView: boolean;
};

type TLinkedNomineeComponentProps = {
  eto: TEtoWithCompanyAndContract;
};

type TLinkedNomineeStateProps = {
  eto: TEtoWithCompanyAndContract | undefined;
};

export const connectToNomineeEto = <T extends {}>(
  WrappedComponent: React.ComponentType<TLinkedNomineeComponentProps & T>,
) =>
  compose<TLinkedNomineeComponentProps & T, T>(
    createErrorBoundary(ErrorBoundaryLayout),
    appConnect<TLinkedNomineeStateProps, {}, T>({
      stateToProps: state => ({
        eto: selectNomineeEto(state),
      }),
    }),
    onEnterAction({
      actionCreator: dispatch => {
        dispatch(actions.eto.getNomineeEtos());
      },
    }),
  )(WrappedComponent);

export const EtoNomineeView = compose<TViewProps, TLinkedNomineeComponentProps>(
  connectToNomineeEto,
  withProps<{ publicView: boolean }, TStateProps>({ publicView: false }),
  withContainer(Layout),
  branch<TStateProps>(props => !props.eto, renderComponent(LoadingIndicator)),
)(EtoView);
