import * as React from "react";
import { FormattedMessage } from "react-intl";
import { compose } from "redux";

import { actions } from "../../../modules/actions";
import { appConnect } from "../../../store";

import { TKycBusinessType } from "../../../lib/api/KycApi.interfaces";
import { injectIntlHelpers } from "../../../utils/injectIntlHelpers";
import { Button } from "../../shared/Buttons";
import { KycPanel } from "../KycPanel";
import { kycRoutes } from "../routes";
import { Panels } from "../shared/Panels";

export const businessSteps = [
  {
    label: "representation",
    isChecked: true
  },
  {
    label: "personal details",
    isChecked: false
  },
  {
    label: "documents verification",
    isChecked: false
  },
  {
    label: "review",
    isChecked: false
  },
];

interface IStateProps {
  loading: boolean;
}

interface IDispatchProps {
  setBusinessType: (type: TKycBusinessType) => void;
}

type IProps = IStateProps & IDispatchProps;

export const KycBusinessStartComponent = injectIntlHelpers<IProps>(
  ({ intl: { formatIntlMessage }, ...props }) => (
    <KycPanel
      steps={businessSteps}
      title={formatIntlMessage("kyc.business.start.title")}
      backLink={kycRoutes.start}
      isMaxWidth={true}
    >
      <Panels
        panels={[
          {
            content: (
              <FormattedMessage id="kyc.business.start.type.small" />
            ),
            id: 1,
            onClick: () => props.setBusinessType("small")
          },
          {
            content: (
              <FormattedMessage id="kyc.business.start.type.corporation" />
            ),
            id: 2,
            onClick: () => props.setBusinessType("corporate")
          },
          {
            content: (
              <FormattedMessage id="kyc.business.start.type.partnership" />
            ),
            id: 3,
            onClick: () => props.setBusinessType("partnership")
          },
        ]}
      />
    </KycPanel>
  ),
);

export const KycBusinessStart = compose<React.SFC>(
  appConnect<IStateProps, IDispatchProps>({
    stateToProps: state => ({
      loading: !!state.kyc.businessDataLoading,
    }),
    dispatchToProps: dispatch => ({
      setBusinessType: (type: TKycBusinessType) => dispatch(actions.kyc.kycSetBusinessType(type)),
    }),
  }),
)(KycBusinessStartComponent);
