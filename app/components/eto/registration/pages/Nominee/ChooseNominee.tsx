import { Section } from "../../Shared";
import { FormFieldLabel } from "../../../../shared/forms/fields/FormFieldLabel";
import { FormattedMessage, FormattedHTMLMessage } from "react-intl-phraseapp";
import { externalRoutes } from "../../../../../config/externalRoutes";
import * as React from "react";
import { branch, compose, renderComponent, setDisplayName } from "recompose";

import { FormHighlightGroup } from "../../../../shared/forms/FormHighlightGroup";
import { EEtoFormTypes } from "../../../../../modules/eto-flow/types";
import { appConnect } from "../../../../../store";
import { NoPendingNominees } from "./NoPendingNominees";
import { onEnterAction } from "../../../../../utils/OnEnterAction";
import { actions } from "../../../../../modules/actions";
import { LoadingIndicator } from "../../../../shared/loading-indicator/LoadingIndicator";
import { selectNomineeRequests } from "../../../../../modules/eto-nominee/selectors";
import { INomineeRequest } from "../../../../../modules/nominee-flow/reducer";
import { nomineeRequestsToArray } from "../../../../../modules/nominee-flow/utils";

interface IStateProps {
  isLoading:boolean;
  nomineeRequests: INomineeRequest[]
}

interface IPendingNomineesProps {
  nomineeRequests: INomineeRequest[]
}

interface IDispatchProps {}

const PendingNomineesComponent:React.FunctionComponent<IPendingNomineesProps> = ({nomineeRequests}) =>
  <>
    <Section>
      <FormFieldLabel name="nominee">
        <FormattedMessage id="eto.form.section.token-holders-rights.nominee" />
      </FormFieldLabel>
      <p>
        <FormattedHTMLMessage
          tagName="span"
          id="eto.form.section.token-holders-rights.eto-id-text"
          values={{ href: externalRoutes.neufundSupportHome }} />
      </p>
      {nomineeRequests.map((request) =>
        <FormHighlightGroup key={request.nomineeId}>
          nomineeId:{request.nomineeId}
          <br/>
          request created at: {request.insertedAt}
          <br/>
          request updated at: {request.updatedAt ? request.updatedAt : null}
        </FormHighlightGroup>
      )}
    </Section>
  </>;

const ChooseNominee = compose<IStateProps, {}>(
  setDisplayName(EEtoFormTypes.Nominee),
  appConnect<IStateProps, IDispatchProps>({
    stateToProps: s => ({
      isLoading: s.etoFlow.loading,
      nomineeRequests: nomineeRequestsToArray(selectNomineeRequests(s))

    }),
    // dispatchToProps: dispatch => ({
    //
    //
    // }),
  }),
  onEnterAction({
    actionCreator: d => d(actions.etoNominee.getNomineeRequests()),
  }),
  branch<IStateProps>(({ isLoading }) => isLoading, renderComponent(LoadingIndicator)),
  branch<IStateProps>(({ nomineeRequests }) => Object.keys(nomineeRequests).length === 0, renderComponent(NoPendingNominees))
)(PendingNomineesComponent);


export { ChooseNominee }
