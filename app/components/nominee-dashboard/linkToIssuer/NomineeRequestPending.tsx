import * as React from "react";
import { FormattedHTMLMessage, FormattedMessage } from "react-intl-phraseapp";

import { StepStatus } from "../DashboardStepStatus";
import { externalRoutes } from "../../../config/externalRoutes";
import { getMessageTranslation } from "../../translatedMessages/messages";
import { nomineeRequestToTranslationMessage } from "../../../modules/nominee-flow/utils";
import { ENomineeRequestStatus } from "../../../modules/nominee-flow/reducer";
import { compose } from "recompose";
import { onEnterAction } from "../../../utils/OnEnterAction";
import { actions } from "../../../modules/actions";
import { onLeaveAction } from "../../../utils/OnLeaveAction";

export const NomineeRequestPendingLayout:React.FunctionComponent = () => {
  return <StepStatus
    contentTitleComponent={<FormattedMessage id="nominee-flow.link-with-issuer.link-with-issuer" />}
    contentTextComponent={[
      <FormattedMessage id="nominee-flow.link-with-issuer.pending.text1" />,
      <FormattedHTMLMessage tagName="span" id="nominee-flow.link-with-issuer.pending.text2" values={{href:externalRoutes.neufundSupportHome}}/>
    ]}
    status={getMessageTranslation(nomineeRequestToTranslationMessage(ENomineeRequestStatus.PENDING))}
  />
};

export const NomineeRequestPending = compose(
  onEnterAction({
    actionCreator: d => d(actions.nomineeFlow.startNomineeRequestsWatcher()),
  }),
  onLeaveAction({
    actionCreator: d => d(actions.nomineeFlow.stopNomineeRequestsWatcher()),
  }),
)(NomineeRequestPendingLayout);
