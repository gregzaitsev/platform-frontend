import * as React from "react";
import { FormattedMessage,FormattedHTMLMessage } from "react-intl-phraseapp";
import { branch, compose, renderComponent, renderNothing, withProps } from "recompose";
import * as cn from 'classnames';

import { appConnect } from "../../store";
import { selectNomineeLinkRequestStatus } from "../../modules/nominee-flow/selectors";
import { ENomineeRequestStatus } from "../../modules/nominee-flow/reducer";
import { NomineeLinkRequestForm } from "./LinkToIssuerForm";
import { StepStatus } from "./DashboardStepStatus";
import { getMessageTranslation } from "../translatedMessages/messages";
import { linkRequestToTranslationMessage } from "../../modules/nominee-flow/utils";
import { externalRoutes } from "../../config/externalRoutes";
import { TTranslatedString } from "../../types";

import * as styles from "./LinkToIssuer.module.scss"

enum ENextState {
  SUCCESS,
  WAIT_WHILE_PENDING,
  REPEAT_LINK_REQUEST,
  SEND_REQUEST,
}

interface IStateProps {
  linkRequestStatus: ENomineeRequestStatus
}

interface IBranchProps {
  nextState: ENextState,
  linkRequestStatus: ENomineeRequestStatus,
}

const nextState = (linkRequestStatus: ENomineeRequestStatus) => {
  if (linkRequestStatus === ENomineeRequestStatus.APPROVED) { //this shouldn't happen here
    return ENextState.SUCCESS
  } else if (linkRequestStatus === ENomineeRequestStatus.PENDING) {
    return ENextState.WAIT_WHILE_PENDING
  } else if (linkRequestStatus === ENomineeRequestStatus.GENERIC_ERROR ||
    linkRequestStatus === ENomineeRequestStatus.ISSUER_ID_ERROR ||
    linkRequestStatus === ENomineeRequestStatus.REJECTED) {
    return ENextState.REPEAT_LINK_REQUEST
  } else {
    return ENextState.SEND_REQUEST
  }
};

export const LinkToIssuerLayout: React.FunctionComponent = () => {
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

export const LinkToIssuerPendingState:React.FunctionComponent = () => {
  return <StepStatus
    contentTitleComponent={<FormattedMessage id="nominee-flow.link-with-issuer.link-with-issuer" />}
    contentTextComponent={[
      <FormattedMessage id="nominee-flow.link-with-issuer.pending.text1" />,
      <FormattedHTMLMessage tagName="span" id="nominee-flow.link-with-issuer.pending.text2" values={{href:externalRoutes.neufundSupportHome}}/>
    ]}
    status={getMessageTranslation(linkRequestToTranslationMessage(ENomineeRequestStatus.PENDING))}
  />
};

const getText = (requestStatus:ENomineeRequestStatus):TTranslatedString => {
  if(requestStatus === ENomineeRequestStatus.REJECTED){
    return <FormattedMessage id="nominee-flow.link-with-issuer.error-link-rejected-text" />
  } else if (requestStatus === ENomineeRequestStatus.ISSUER_ID_ERROR) {
    return <FormattedMessage id="nominee-flow.link-with-issuer.issuer-id-error-text" />
  } else if (requestStatus === ENomineeRequestStatus.GENERIC_ERROR) {
    return <FormattedMessage id="nominee-flow.link-with-issuer.generic-error-text" />
  } else {
    throw new Error("invalid request status passed into this component")
  }
};

export const RepeatLinkToIssuerLayout: React.FunctionComponent<IStateProps> = ({linkRequestStatus}) => {
  return <>
    <h1 className={styles.title}>
      <FormattedMessage id="nominee-flow.link-with-issuer.link-with-issuer" />
    </h1>
    <p className={cn(styles.text,styles.error)}>
      {getText(linkRequestStatus)}
    </p>
    <NomineeLinkRequestForm />
  </>
};


export const LinkToIssuer = compose<IStateProps, {}>(
  appConnect<IStateProps>({
    stateToProps: state => ({
      linkRequestStatus: selectNomineeLinkRequestStatus(state)
    }),
  }),
  withProps<{ nextState: ENextState }, IStateProps>(({ linkRequestStatus }) => ({ nextState: nextState(linkRequestStatus) })),
  branch<IBranchProps>(({ nextState }) => nextState === ENextState.SUCCESS, renderNothing), //this state should be caught before
  branch<IBranchProps>(({ nextState }) => nextState === ENextState.WAIT_WHILE_PENDING, renderComponent(LinkToIssuerPendingState)),
  branch<IBranchProps>(({ nextState }) => nextState === ENextState.REPEAT_LINK_REQUEST, renderComponent(RepeatLinkToIssuerLayout)),
)(LinkToIssuerLayout);
