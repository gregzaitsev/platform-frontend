import * as React from "react";
import { FormattedMessage, FormattedHTMLMessage } from "react-intl-phraseapp";
import { branch, compose, renderNothing } from "recompose";
import { selectBusinessClientName, } from "../../modules/kyc/selectors";
import { appConnect } from "../../store";
import { AccountSetupKycPendingComponent } from "../settings/kyc-states/KycStatusWidget";
import { Panel } from "../shared/Panel";

import { DashboardTitle } from "./NomineeDashboard";

import * as styles from "./NomineeDashboard.module.scss";


interface IKycPendingProps {
  name: string
}

const NomineeKycPendingLayout:React.FunctionComponent<IKycPendingProps> = ({name}) =>
  <>
    <DashboardTitle
      title={<FormattedHTMLMessage tagName="span" id="account-setup.thank-you-title" values ={{name}}/>}
      text={<FormattedMessage id="account-setup.thank-you-text"/>}
    />
    <Panel className={styles.dashboardContentPanel}>
      <h1>
        <FormattedMessage id="account-setup.pending-kyc.title" />[pending]
      </h1>
      <p>
        <FormattedHTMLMessage tagName="span" id="account-setup.pending-kyc.text" />
      </p>
      <AccountSetupKycPendingComponent />
    </Panel>
  </>


export const NomineeKycPending = compose<IKycPendingProps, {}>(
  appConnect<IKycPendingProps | null>({
    stateToProps: state => {
      const name = selectBusinessClientName(state)
      if(name){
        return {name}
      } else {
        return null
      }
    },
  }),
  branch<IKycPendingProps | null>(props => props === null, renderNothing)
)(NomineeKycPendingLayout);
