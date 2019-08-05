import * as React from "react";
import { FormattedMessage } from "react-intl-phraseapp";
import { branch, compose, renderComponent, setDisplayName } from "recompose";

import { actions } from "../../../../../modules/actions";
import { EEtoFormTypes } from "../../../../../modules/eto-flow/types";
import {
  selectNomineeRequests,
} from "../../../../../modules/eto-nominee/selectors";
import { INomineeRequest } from "../../../../../modules/nominee-flow/reducer";
import { nomineeRequestsToArray } from "../../../../../modules/nominee-flow/utils";
import { appConnect } from "../../../../../store";
import { onEnterAction } from "../../../../../utils/OnEnterAction";
import { onLeaveAction } from "../../../../../utils/OnLeaveAction";
import { Button, EButtonLayout } from "../../../../shared/buttons/Button";
import { FormFieldLabel } from "../../../../shared/forms/fields/FormFieldLabel";
import { FormHighlightGroup } from "../../../../shared/forms/FormHighlightGroup";
import { Section } from "../../Shared";
import { NoPendingNominees } from "./NoPendingNominees";

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
  <div>
    <Button
      layout={EButtonLayout.PRIMARY}
      onClick={() => acceptNominee(nomineeId)}
      // isLoading={props.savingData}
      data-test-id="eto-registration-product-vision-submit"
    >
      Accept
    </Button>
    <Button
      layout={EButtonLayout.PRIMARY}
      onClick={() => rejectNominee(nomineeId)}
      data-test-id="eto-registration-product-vision-submit"
    >
      Reject
    </Button>
  </div>
);

const OneButtonBlock: React.FunctionComponent<IOneButtonBlockProps> = ({
  acceptNominee,
  nomineeId,
}) => (
  <div>
    <Button
      layout={EButtonLayout.PRIMARY}
      onClick={() => acceptNominee(nomineeId)}
      // isLoading={props.savingData}
      data-test-id="eto-registration-product-vision-submit"
    >
      Choose
    </Button>
  </div>
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
        <FormattedMessage id="eto.form.section.token-holders-rights.nominee" />
      </FormFieldLabel>
      {nomineeRequests.map(request => (
        <FormHighlightGroup key={request.nomineeId}>
          {/*fixme this is a dummy*/}
          nomineeId:{request.nomineeId}
          <br />
          request created at: {request.insertedAt}
          <br />
          request updated at: {request.updatedAt ? request.updatedAt : null}
          {nomineeRequests.length > 1 ? (
            <OneButtonBlock acceptNominee={acceptNominee} nomineeId={request.nomineeId} />
          ) : (
            <FullButtonBlock
              acceptNominee={acceptNominee}
              rejectNominee={rejectNominee}
              nomineeId={request.nomineeId}
            />
          )}
        </FormHighlightGroup>
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
