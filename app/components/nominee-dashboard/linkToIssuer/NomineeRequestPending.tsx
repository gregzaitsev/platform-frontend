import * as React from "react";
import { FormattedHTMLMessage, FormattedMessage } from "react-intl-phraseapp";
import { compose } from "recompose";

import { externalRoutes } from "../../../config/externalRoutes";
import { actions } from "../../../modules/actions";
import { ENomineeRequestStatus } from "../../../modules/nominee-flow/reducer";
import { nomineeRequestToTranslationMessage } from "../../../modules/nominee-flow/utils";
import { onEnterAction } from "../../../utils/OnEnterAction";
import { onLeaveAction } from "../../../utils/OnLeaveAction";
import { getMessageTranslation } from "../../translatedMessages/messages";
import { StepStatus } from "../DashboardStepStatus";

export const NomineeRequestPendingLayout: React.FunctionComponent = () => (
  <StepStatus
    contentTitleComponent={<FormattedMessage id="nominee-flow.link-with-issuer.link-with-issuer" />}
    contentTextComponent={[
      <FormattedMessage id="nominee-flow.link-with-issuer.pending.text1" />,
      <FormattedHTMLMessage
        tagName="span"
        id="nominee-flow.link-with-issuer.pending.text2"
        values={{ href: externalRoutes.neufundSupportHome }}
      />,
    ]}
    status={getMessageTranslation(
      nomineeRequestToTranslationMessage(ENomineeRequestStatus.PENDING),
    )}
  />
);

export const NomineeRequestPending = compose(
  onEnterAction({
    actionCreator: d => d(actions.nomineeFlow.startNomineeRequestsWatcher()),
  }),
  onLeaveAction({
    actionCreator: d => d(actions.nomineeFlow.stopNomineeRequestsWatcher()),
  }),
)(NomineeRequestPendingLayout);
