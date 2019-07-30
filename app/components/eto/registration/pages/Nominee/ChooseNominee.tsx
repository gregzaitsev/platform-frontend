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
import { IEtoNomineeRequest } from "../../../../../modules/eto-nominee/reducer";
import { DeepReadonly } from "../../../../../types";

interface IStateProps {
  isLoading:boolean;
  selectNomineeRequests: DeepReadonly<IEtoNomineeRequest[]>
}

interface IDispatchProps {}

const PendingNomineesComponent = ({}) =>
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

      <FormHighlightGroup>
      </FormHighlightGroup>


    </Section>
  </>;

const ChooseNominee = compose<IStateProps, {}>(
  setDisplayName(EEtoFormTypes.EtoVotingRights),
  appConnect<IStateProps, IDispatchProps>({
    stateToProps: s => ({
      isLoading: s.etoFlow.loading,
      selectNomineeRequests: selectNomineeRequests(s)

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
  branch<IStateProps>(({ selectNomineeRequests }) => selectNomineeRequests.length === 0, renderComponent(NoPendingNominees))
)(PendingNomineesComponent);


export { ChooseNominee }
