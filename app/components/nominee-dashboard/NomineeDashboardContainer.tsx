import * as React from "react";
import { compose } from "recompose";

import { actions } from "../../modules/actions";
import { selectEtoWithCompanyAndContractById } from "../../modules/eto/selectors";
import { TEtoWithCompanyAndContract } from "../../modules/eto/types";
import { selectLinkedNomineeEtoId } from "../../modules/nominee-flow/selectors";
import { appConnect } from "../../store";
import { onEnterAction } from "../../utils/OnEnterAction";
import { NomineeEtoOverviewThumbnail } from "../eto/overview/EtoOverviewThumbnail/EtoOverviewThumbnail";
import { ENomineeTask } from "./NomineeTasksData";

import * as styles from "./NomineeDashboard.module.scss";

interface IExternalProps {
  nomineeTaskStep: ENomineeTask
}

interface ILinkedNomineeStateProps {
  eto: TEtoWithCompanyAndContract | undefined;
}

interface ILinkedNomineeComponentProps {
  eto: TEtoWithCompanyAndContract;
}

export const AccountSetupContainer: React.FunctionComponent = ({ children }) => (
  <div className={styles.accountSetupWrapper}>
    {children}
  </div>
);

const NotLinkedNomineeDashboardContainer: React.FunctionComponent = ({ children }) => (
  <div data-test-id="nominee-dashboard" className={styles.nomineeDashboardContainer}>
    {/*<section className={styles.dashboardContentPanel}>*/}
      {children}
    {/*</section>*/}
  </div>
);

const LinkedNomineeDashboardContainerLayout: React.FunctionComponent<ILinkedNomineeComponentProps> = ({ children, eto }) => (
  <div data-test-id="nominee-dashboard" className={styles.linkedNomineeDashboardContainer}>
    <section className={styles.dashboardContentPanel}>
      {children}
    </section>
    {eto && <NomineeEtoOverviewThumbnail eto={eto} shouldOpenInNewWindow={false} />}
  </div>
);

const LinkedNomineeDashboardContainer = compose<ILinkedNomineeComponentProps, {}>(
  appConnect<ILinkedNomineeStateProps, {}, {}>({
    stateToProps: state => {
      const linkedNomineeEtoId = selectLinkedNomineeEtoId(state)
      if (linkedNomineeEtoId) {
        return ({
          eto: selectEtoWithCompanyAndContractById(state, linkedNomineeEtoId),
        })
      } else {
        throw new Error("linked nominee eto id is invalid")
      }
    }
  }),
  onEnterAction<{}>({
    actionCreator: dispatch => {
      dispatch(actions.eto.getNomineeEtos());
    },
  }),
)(LinkedNomineeDashboardContainerLayout);

const NomineeDashboardContainer: React.FunctionComponent<IExternalProps> = ({ nomineeTaskStep, children }) => {
  console.log("NomineeDashboardContainer", nomineeTaskStep)
  switch (nomineeTaskStep) {
    case ENomineeTask.ACCOUNT_SETUP:
      return <AccountSetupContainer children={children} />
    case ENomineeTask.LINK_TO_ISSUER:
      return <NotLinkedNomineeDashboardContainer children={children} />
    case ENomineeTask.LINK_BANK_ACCOUNT:
      return <LinkedNomineeDashboardContainer children={children} />
    case ENomineeTask.ACCEPT_THA:
      return <LinkedNomineeDashboardContainer children={children} />
    case ENomineeTask.REDEEM_SHARE_CAPITAL:
      return <LinkedNomineeDashboardContainer children={children} />
    case ENomineeTask.ACCEPT_ISHA:
      return <LinkedNomineeDashboardContainer children={children} />
    case ENomineeTask.NONE:
    default:
      return <NotLinkedNomineeDashboardContainer children={children} />
  }
}

export { NomineeDashboardContainer, NotLinkedNomineeDashboardContainer };
