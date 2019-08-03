import * as React from "react";
import { branch, compose, renderComponent } from "recompose";

import { actions } from "../../modules/actions";
import { selectEtoWithCompanyAndContractById } from "../../modules/eto/selectors";
import { TEtoWithCompanyAndContract } from "../../modules/eto/types";
import { selectLinkedNomineeEtoId } from "../../modules/nominee-flow/selectors";
import { appConnect } from "../../store";
import { onEnterAction } from "../../utils/OnEnterAction";
import { NomineeEtoOverviewThumbnail } from "../eto/overview/EtoOverviewThumbnail/EtoOverviewThumbnail";

import * as styles from "./NomineeDashboard.module.scss";

interface IStateProps {
  linkedNomineeEtoId: string | undefined;
}

interface ILinkedNomineeStateProps {
  eto: TEtoWithCompanyAndContract | undefined;
}

interface ILinkedNomineeExternalProps {
  linkedNomineeEtoId: string;
}

interface ILinkedNomineeComponentProps {
  eto: TEtoWithCompanyAndContract;
}

const NomineeDashboardContainerLayout: React.FunctionComponent = ({ children }) => (
  <div data-test-id="nominee-dashboard" className={styles.nomineeDashboardContainer}>
    {children}
  </div>
);

const LinkedNomineeDashboardContainerLayout: React.FunctionComponent<
  ILinkedNomineeComponentProps
> = ({ children, eto }) => (
  <div data-test-id="nominee-dashboard" className={styles.linkedNomineeDashboardContainer}>
    {children}
    {eto && <NomineeEtoOverviewThumbnail eto={eto} shouldOpenInNewWindow={false} />}
  </div>
);

const LinkedNomineeDashboardContainer = compose<
  ILinkedNomineeComponentProps,
  ILinkedNomineeExternalProps
>(
  appConnect<ILinkedNomineeStateProps, {}, ILinkedNomineeExternalProps>({
    stateToProps: (state, props) => ({
      eto: selectEtoWithCompanyAndContractById(state, props.linkedNomineeEtoId),
    }),
  }),
  onEnterAction<ILinkedNomineeExternalProps>({
    actionCreator: dispatch => {
      dispatch(actions.eto.getNomineeEtos());
    },
  }),
)(LinkedNomineeDashboardContainerLayout);

const NomineeDashboardContainer = compose(
  appConnect<IStateProps>({
    stateToProps: state => ({
      linkedNomineeEtoId: selectLinkedNomineeEtoId(state),
    }),
  }),
  branch<IStateProps>(
    ({ linkedNomineeEtoId }) => linkedNomineeEtoId !== undefined,
    renderComponent(LinkedNomineeDashboardContainer),
  ),
)(NomineeDashboardContainerLayout);

export { NomineeDashboardContainer, NomineeDashboardContainerLayout };
