import * as React from "react";
import { FormattedMessage } from "react-intl-phraseapp";
import { branch, compose, renderComponent, setDisplayName } from "recompose";

import { actions } from "../../../../../modules/actions";
import { EEtoFormTypes } from "../../../../../modules/eto-flow/types";
import { selectNomineeRequests } from "../../../../../modules/eto-nominee/selectors";
import { INomineeRequest } from "../../../../../modules/nominee-flow/reducer";
import { nomineeRequestsToArray } from "../../../../../modules/nominee-flow/utils";
import { appConnect } from "../../../../../store";
import { onEnterAction } from "../../../../../utils/OnEnterAction";
import { onLeaveAction } from "../../../../../utils/OnLeaveAction";
import { Button, EButtonLayout, EButtonTheme } from "../../../../shared/buttons/Button";
import { FormFieldLabel } from "../../../../shared/forms/fields/FormFieldLabel";
import { FormHighlightGroup } from "../../../../shared/forms/FormHighlightGroup";
import { Section } from "../../Shared";
import { NoPendingNominees } from "./NoPendingNominees";

import * as styles from "./Nominee.module.scss";

interface IStateProps {
  nomineeRequests: INomineeRequest[];
}

interface IDispatchProps {
  acceptNominee: (nomineeId: string) => void;
  rejectNominee: (nomineeId: string) => void;
}

interface IPendingNomineesProps {
  nomineeRequests: INomineeRequest[];
  acceptNominee: (nomineeId: string) => void;
  rejectNominee: (nomineeId: string) => void;
}

interface IPendingNomineeRequest {
  request: INomineeRequest;
  nomineeRequestsLength: number;
  acceptNominee: (nomineeId: string) => void;
  rejectNominee: (nomineeId: string) => void;
}

interface IFullButtonBlockProps {
  acceptNominee: (nomineeId: string) => void;
  rejectNominee: (nomineeId: string) => void;
  nomineeId: string;
}

interface IOneButtonBlockProps {
  acceptNominee: (nomineeId: string) => void;
  nomineeId: string;
}

const FullButtonBlock: React.FunctionComponent<IFullButtonBlockProps> = ({
  acceptNominee,
  rejectNominee,
  nomineeId,
}) => (
  <div className={styles.buttonBlock}>
    <Button
      layout={EButtonLayout.PRIMARY}
      theme={EButtonTheme.BRAND}
      onClick={() => acceptNominee(nomineeId)}
      data-test-id="eto-nominee-accept"
    >
      <FormattedMessage id="eto.form.section.eto-nominee.nominee-request.accept" />
    </Button>
    <Button
      layout={EButtonLayout.PRIMARY}
      onClick={() => rejectNominee(nomineeId)}
      data-test-id="eto-nominee-reject"
    >
      <FormattedMessage id="eto.form.section.eto-nominee.nominee-request.reject" />
    </Button>
  </div>
);

const OneButtonBlock: React.FunctionComponent<IOneButtonBlockProps> = ({
  acceptNominee,
  nomineeId,
}) => (
  <div className={styles.buttonBlock}>
    <Button
      layout={EButtonLayout.PRIMARY}
      onClick={() => acceptNominee(nomineeId)}
      theme={EButtonTheme.BRAND}
      data-test-id="eto-nominee-choose"
    >
      <FormattedMessage id="eto.form.section.eto-nominee.nominee-request.choose" />
    </Button>
  </div>
);

const PendingNomineeRequest: React.FunctionComponent<IPendingNomineeRequest> = ({
  request,
  nomineeRequestsLength,
  acceptNominee,
  rejectNominee,
}) => (
  <FormHighlightGroup key={request.nomineeId} className={styles.pendingNomineeRequest}>
    <p className={styles.pendingNomineeRequestText}>
      <FormattedMessage id="eto.form.section.eto-nominee.nominee-request-text" />
    </p>

    <div className={styles.pendingNomineeRequestInfo}>
      <section>
        <h5>
          <FormattedMessage id="eto.form.section.eto-nominee.nominee-request.company" />
        </h5>

        <p>{request.metadata.name}</p>
        <p>
          <FormattedMessage id="eto.form.section.eto-nominee.nominee-request.registration-number" />{" "}
          {request.metadata.registrationNumber}
        </p>
      </section>

      <section>
        <h5>
          <FormattedMessage id="eto.form.section.eto-nominee.nominee-request.address" />
        </h5>
        <p>{`${request.metadata.street}, ${request.metadata.zipCode} ${request.metadata.city}`}</p>
      </section>

      <section>
        <h5>
          <FormattedMessage id="eto.form.section.eto-nominee.nominee-request.neufund-account" />
        </h5>
        <p>{request.nomineeId}</p>
      </section>
    </div>

    {nomineeRequestsLength > 1 ? (
      <OneButtonBlock acceptNominee={acceptNominee} nomineeId={request.nomineeId} />
    ) : (
      <FullButtonBlock
        acceptNominee={acceptNominee}
        rejectNominee={rejectNominee}
        nomineeId={request.nomineeId}
      />
    )}
  </FormHighlightGroup>
);

const PendingNomineesComponent: React.FunctionComponent<IPendingNomineesProps> = ({
  nomineeRequests,
  acceptNominee,
  rejectNominee,
}) => (
  <>
    <NoPendingNominees />
    <Section>
      <FormFieldLabel name="nominee">
        <FormattedMessage id="eto.form.section.eto-nominee.nominee" />
      </FormFieldLabel>
      {nomineeRequests.map(request => (
        <PendingNomineeRequest
          key={request.nomineeId}
          request={request}
          nomineeRequestsLength={nomineeRequests.length}
          acceptNominee={acceptNominee}
          rejectNominee={rejectNominee}
        />
      ))}
    </Section>
  </>
);

const ChooseNominee = compose<IStateProps & IDispatchProps, {}>(
  setDisplayName(EEtoFormTypes.Nominee),
  appConnect<IStateProps, IDispatchProps>({
    stateToProps: s => ({
      nomineeRequests: nomineeRequestsToArray(selectNomineeRequests(s)),
    }),
    dispatchToProps: dispatch => ({
      acceptNominee: (nomineeId: string) =>
        dispatch(actions.etoNominee.acceptNomineeRequest(nomineeId)),
      rejectNominee: (nomineeId: string) =>
        dispatch(actions.etoNominee.rejectNomineeRequest(nomineeId)),
    }),
  }),
  onEnterAction({
    actionCreator: d => d(actions.etoNominee.startNomineeRequestsWatcher()),
  }),
  onLeaveAction({
    actionCreator: d => d(actions.etoNominee.stopNomineeRequestsWatcher()),
  }),
  branch<IStateProps>(
    ({ nomineeRequests }) => Object.keys(nomineeRequests).length === 0,
    renderComponent(NoPendingNominees),
  ),
)(PendingNomineesComponent);

export { ChooseNominee };
