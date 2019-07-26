import * as React from "react";
import { FormattedMessage } from "react-intl-phraseapp";
import { compose } from "recompose";

import { appConnect } from "../../store";
import { actions } from "../../modules/actions";
import { IIntlProps, injectIntlHelpers } from "../../utils/injectIntlHelpers.unsafe";
import { NomineeLinkRequestFormBase } from "./LinkToIssuerForm";
import { selectIsLoading } from "../../modules/nominee-flow/selectors";

import * as styles from "./LinkToIssuer.module.scss"

interface IDispatchProps {
  createNomineeRequest: (issuerId: string) => void
}

interface IStateProps {
  isLoading: boolean
}

const NomineeLinkRequestForm = compose<IIntlProps & IStateProps & IDispatchProps, {}>(
  appConnect<IStateProps, IDispatchProps>({
    stateToProps: state => ({
      isLoading: selectIsLoading(state)
    }),
    dispatchToProps: dispatch => ({
      createNomineeRequest: (issuerId) => {
        dispatch(actions.nomineeFlow.createNomineeRequest(issuerId));
      },
    })
  }),
  injectIntlHelpers
)(NomineeLinkRequestFormBase);


export const LinkToIssuer: React.FunctionComponent<IDispatchProps> = () => {
  return <>
    <h1 className={styles.title}>
      <FormattedMessage id="nominee-flow.link-with-issuer.link-with-issuer" />
    </h1>
    <p className={styles.text}>
      <FormattedMessage id="nominee-flow.link-with-issuer.enter-wallet-address" />
    </p>
    <NomineeLinkRequestForm />
  </>
};
