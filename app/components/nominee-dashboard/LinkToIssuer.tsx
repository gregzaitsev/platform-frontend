import * as React from "react";
import { FormattedMessage } from "react-intl-phraseapp";
import { compose } from "recompose";

import { appConnect } from "../../store";
import { selectNomineeLinkRequestStatus } from "../../modules/nominee-flow/selectors";
import { ENomineeLinkRequestStatus } from "../../modules/nominee-flow/reducer";
import { NomineeLinkRequestForm } from "./LinkToIssuerForm";

import * as styles from "./LinkToIssuer.module.scss"

interface IStateProps {
  linkRequestStatus: ENomineeLinkRequestStatus
}

export const NomineeLinkRequestStatus:React.FunctionComponent<IStateProps> = ({linkRequestStatus}) =>
  <>{linkRequestStatus}
  </>;


export const LinkToIssuerLayout: React.FunctionComponent<IStateProps> = ({linkRequestStatus}) => {
  return <>
    <h1 className={styles.title}>
      <FormattedMessage id="nominee-flow.link-with-issuer.link-with-issuer" />
    </h1>
    <p className={styles.text}>
      <FormattedMessage id="nominee-flow.link-with-issuer.enter-wallet-address" />
    </p>
    {linkRequestStatus === ENomineeLinkRequestStatus.NONE
    ? <NomineeLinkRequestForm />
    : <NomineeLinkRequestStatus linkRequestStatus={linkRequestStatus} />
    }
  </>
};

export const LinkToIssuer = compose<IStateProps, {}>(
  appConnect<IStateProps>({
    stateToProps: state => ({
      linkRequestStatus: selectNomineeLinkRequestStatus(state)
    }),
  }),
)(LinkToIssuerLayout);
