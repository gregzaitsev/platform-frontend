import * as React from "react";
import * as styles from "./NomineeDashboard.module.scss";
import { branch, compose, renderComponent, renderNothing } from "recompose";
import { appConnect } from "../../store";
import {
  selectLinkedNomineeEto,
} from "../../modules/nominee-flow/selectors";
import { onEnterAction } from "../../utils/OnEnterAction";
import { actions } from "../../modules/actions";
import { selectEtoWithCompanyAndContractById } from "../../modules/eto/selectors";
import { TEtoWithCompanyAndContract } from "../../modules/eto/types";

interface IStateProps {
  linkedNomineeEtoId: string | undefined
}

interface ILinkedNomineeStateProps {
  eto: TEtoWithCompanyAndContract | undefined
}

interface ILinkedNomineeExternalProps {
  linkedNomineeEtoId: string
}

interface ILinkedNomineeComponentProps {
  eto: TEtoWithCompanyAndContract
}

const NomineeDashboardContainerLayout: React.FunctionComponent = ({ children }) => (
  <div data-test-id="nominee-dashboard" className={styles.nomineeDashboardContainer}>
    {children}
  </div>
);

const LinkedNomineeDashboardContainerLayout: React.FunctionComponent<ILinkedNomineeComponentProps> = ({ children, eto }) => (
  <div data-test-id="nominee-dashboard" className={styles.nomineeDashboardContainer}>
    {children}
    {eto}
  </div>
);

const LinkedNomineeDashboardContainer = compose<ILinkedNomineeComponentProps, ILinkedNomineeExternalProps>(
  appConnect<ILinkedNomineeStateProps,{},ILinkedNomineeExternalProps>({
    stateToProps: (state, props) => ({
      eto: selectEtoWithCompanyAndContractById(state,props.linkedNomineeEtoId)
    })
  }),
  branch<ILinkedNomineeStateProps>(({eto}) => eto === undefined, renderNothing),
  onEnterAction<IStateProps>({
    actionCreator: (dispatch, { linkedNomineeEtoId }) => {
      if (linkedNomineeEtoId !== undefined)
        dispatch(actions.eto.loadEto(linkedNomineeEtoId))
    }
  }),
)(LinkedNomineeDashboardContainerLayout)


const NomineeDashboardContainer = compose(
  appConnect<IStateProps>({
    stateToProps: state => ({
      linkedNomineeEtoId:selectLinkedNomineeEto(state),
    })
  }),
  branch<IStateProps>(({linkedNomineeEtoId}) => linkedNomineeEtoId !== undefined, renderComponent(LinkedNomineeDashboardContainer))
)(NomineeDashboardContainerLayout)

export { NomineeDashboardContainer, NomineeDashboardContainerLayout }
