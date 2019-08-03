import * as cn from "classnames";
import * as React from "react";
import { FormattedHTMLMessage, FormattedMessage } from "react-intl-phraseapp";
import { branch, compose, renderComponent, renderNothing, withProps } from "recompose";

import {
  ENomineeRequestError,
  ENomineeRequestStatus,
  INomineeRequest,
} from "../../../modules/nominee-flow/reducer";
import {
  selectNomineeRequests,
  selectNomineeStateError,
} from "../../../modules/nominee-flow/selectors";
import { takeLatestNomineeRequest } from "../../../modules/nominee-flow/utils";
import { appConnect } from "../../../store";
import { TTranslatedString } from "../../../types";
import { NomineeLinkRequestForm } from "./LinkToIssuerForm";
import { NomineeRequestPending } from "./NomineeRequestPending";
import { withContainer } from "../../../utils/withContainer.unsafe";

import * as styles from "./LinkToIssuer.module.scss";

enum ENextState {
  SUCCESS = "success",
  WAIT_WHILE_PENDING = "waitWhilePending",
  REPEAT_LINK_REQUEST = "repeatLinkRequest",
  SEND_REQUEST = "sendRequest",
}

interface IStateProps {
  nomineeRequest: INomineeRequest | undefined;
  nomineeRequestError: ENomineeRequestError;
}

interface IRepeatRequestProps {
  nomineeRequest: INomineeRequest;
  nomineeRequestError: ENomineeRequestError;
}

interface IBranchProps {
  nextState: ENextState;
  nomineeRequest: INomineeRequest | undefined;
  nomineeRequestError: ENomineeRequestError;
}

const nextState = (
  nomineeRequest: INomineeRequest | undefined,
  nomineeRequestError: ENomineeRequestError,
) => {
  if (!nomineeRequest && nomineeRequestError === ENomineeRequestError.NONE) {
    return ENextState.SEND_REQUEST;
  } else if (!nomineeRequest && nomineeRequestError === ENomineeRequestError.REQUEST_EXISTS) {
    throw new Error("invalid nominee request state");
  } else if (!nomineeRequest && nomineeRequestError !== ENomineeRequestError.NONE) {
    return ENextState.REPEAT_LINK_REQUEST;
  } else if (nomineeRequest && nomineeRequest.state === ENomineeRequestStatus.APPROVED) {
    return ENextState.SUCCESS;
  } else if (nomineeRequest && nomineeRequest.state === ENomineeRequestStatus.PENDING) {
    return ENextState.WAIT_WHILE_PENDING;
  } else if (nomineeRequest && nomineeRequest.state === ENomineeRequestStatus.REJECTED) {
    return ENextState.REPEAT_LINK_REQUEST;
  } else {
    throw new Error("invalid nominee request state");
  }
};

const getText = (
  requestStatus: INomineeRequest,
  nomineeRequestError: ENomineeRequestError,
): TTranslatedString => {
  if (
    requestStatus.state === ENomineeRequestStatus.REJECTED &&
    (nomineeRequestError === ENomineeRequestError.NONE ||
      nomineeRequestError === ENomineeRequestError.REQUEST_EXISTS)
  ) {
    return (
      <FormattedHTMLMessage
        tagName="span"
        id="nominee-flow.link-with-issuer.error-link-rejected-text"
        values={{ etoId: requestStatus.etoId }}
      />
    );
  } else if (nomineeRequestError === ENomineeRequestError.ISSUER_ID_ERROR) {
    return <FormattedMessage id="nominee-flow.link-with-issuer.issuer-id-error-text" />;
  } else if (nomineeRequestError === ENomineeRequestError.GENERIC_ERROR) {
    return <FormattedMessage id="nominee-flow.link-with-issuer.generic-error-text" />;
  } else {
    throw new Error("invalid nominee request status ");
  }
};

export const RepeatNomineeRequestLayout: React.FunctionComponent<IRepeatRequestProps> = ({
  nomineeRequest,
  nomineeRequestError,
}) => (
  <>
    <h1 className={styles.title}>
      <FormattedMessage id="nominee-flow.link-with-issuer.link-with-issuer" />
    </h1>
    <p className={cn(styles.text, styles.error)}>
      {getText(nomineeRequest, nomineeRequestError)}
    </p>
    <NomineeLinkRequestForm />
  </>
);

export const CreateNomineeRequestLayout: React.FunctionComponent = () => (
  <>
    <h1 className={styles.title}>
      <FormattedMessage id="nominee-flow.link-with-issuer.link-with-issuer" />
    </h1>
    <p className={styles.text}>
      <FormattedMessage id="nominee-flow.link-with-issuer.enter-wallet-address" />
    </p>
    <NomineeLinkRequestForm />
  </>
);

export const NomineeRequestContainer:React.FunctionComponent = ({children}) =>
  <section className={styles.linkToIssuerContentPanel}>
    {children}
  </section>

export const LinkToIssuer = compose<IStateProps, {}>(
  appConnect<IStateProps>({
    stateToProps: state => ({
      nomineeRequest: takeLatestNomineeRequest(selectNomineeRequests(state)), //only take the latest one for now
      nomineeRequestError: selectNomineeStateError(state),
    }),
  }),
  withProps<{ nextState: ENextState }, IStateProps>(({ nomineeRequest, nomineeRequestError }) => ({
    nextState: nextState(nomineeRequest, nomineeRequestError),
  })),
  branch<IBranchProps>(({ nextState }) => nextState === ENextState.SUCCESS, renderNothing), //this state should be caught before
  branch<IBranchProps>(
    ({ nextState }) => nextState === ENextState.WAIT_WHILE_PENDING,
    renderComponent(NomineeRequestPending),
  ),
  withContainer(NomineeRequestContainer),
  branch<IBranchProps>(
    ({ nextState }) => nextState === ENextState.REPEAT_LINK_REQUEST,
    renderComponent(RepeatNomineeRequestLayout),
  ),
)(CreateNomineeRequestLayout);
