import * as React from "react";
import { compose } from "recompose";

import { actions } from "../../../modules/actions";
import { selectUserId } from "../../../modules/auth/selectors";
import { selectEtoOfNominee } from "../../../modules/eto/selectors";
import { TEtoWithCompanyAndContract } from "../../../modules/eto/types";
import { appConnect } from "../../../store";
import { onEnterAction } from "../../../utils/OnEnterAction";
import { NomineeEtoOverviewThumbnail } from "../../eto/overview/EtoOverviewThumbnail/EtoOverviewThumbnail";

import * as styles from "../NomineeDashboard.module.scss";

interface ILinkedNomineeStateProps {
  eto: TEtoWithCompanyAndContract | undefined;
}

interface ILinkedNomineeComponentProps {
  eto: TEtoWithCompanyAndContract;
}

const LinkedNomineeDashboardContainerLayout: React.FunctionComponent<
  ILinkedNomineeComponentProps
> = ({ children, eto }) => (
  <div data-test-id="nominee-dashboard" className={styles.linkedNomineeDashboardContainer}>
    <section className={styles.dashboardContentPanel}>{children}</section>
    {eto && <NomineeEtoOverviewThumbnail eto={eto} shouldOpenInNewWindow={false} />}
  </div>
);

export const LinkedNomineeDashboardContainer = compose<ILinkedNomineeComponentProps, {}>(
  appConnect<ILinkedNomineeStateProps, {}, {}>({
    stateToProps: state => {
      const nomineeId = selectUserId(state);
      if (nomineeId) {
        return {
          eto: selectEtoOfNominee(state, nomineeId),
        };
      } else {
        throw new Error("userId is invalid");
      }
    },
  }),
  onEnterAction<{}>({
    actionCreator: dispatch => {
      dispatch(actions.eto.getNomineeEtos());
    },
  }),
)(LinkedNomineeDashboardContainerLayout);
