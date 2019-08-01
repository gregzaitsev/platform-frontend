import * as React from "react";
import * as styles from "./NomineeDashboard.module.scss";
import { branch, compose, renderComponent } from "recompose";
import { appConnect } from "../../store";
import {
  selectLinkedNomineeEtoId,
} from "../../modules/nominee-flow/selectors";
import { onEnterAction } from "../../utils/OnEnterAction";
import { actions } from "../../modules/actions";
import { selectEtoWithCompanyAndContractById } from "../../modules/eto/selectors";
import { TEtoWithCompanyAndContract } from "../../modules/eto/types";
import { EtoOverviewThumbnail } from "../eto/overview/EtoOverviewThumbnail/EtoOverviewThumbnail";

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
    ETO data goes here, need to add an api method (GET /nominees/me/etos)
    {/*{eto && <EtoOverviewThumbnail eto={eto} shouldOpenInNewWindow={false} />}*/}
  </div>
);

const LinkedNomineeDashboardContainer = compose<ILinkedNomineeComponentProps, ILinkedNomineeExternalProps>(
  appConnect<ILinkedNomineeStateProps,{},ILinkedNomineeExternalProps>({
    stateToProps: (state, props) => ({
      eto: selectEtoWithCompanyAndContractById(state,props.linkedNomineeEtoId)
    })
  }),
  onEnterAction<IStateProps>({
    actionCreator: (dispatch, { linkedNomineeEtoId }) => {
      if (linkedNomineeEtoId !== undefined)
        dispatch(actions.eto.loadEto(linkedNomineeEtoId))
    }
  }),
)(LinkedNomineeDashboardContainerLayout);


const NomineeDashboardContainer = compose(
  appConnect<IStateProps>({
    stateToProps: state => ({
      linkedNomineeEtoId:selectLinkedNomineeEtoId(state),
    })
  }),
  branch<IStateProps>(({linkedNomineeEtoId}) => linkedNomineeEtoId !== undefined, renderComponent(LinkedNomineeDashboardContainer))
)(NomineeDashboardContainerLayout);

export { NomineeDashboardContainer, NomineeDashboardContainerLayout }
