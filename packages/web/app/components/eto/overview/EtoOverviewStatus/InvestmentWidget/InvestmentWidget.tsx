import * as React from "react";
import { FormattedMessage } from "react-intl-phraseapp";
import { compose } from "recompose";

import { actions } from "../../../../../modules/actions";
import { selectIsAuthorized, selectIsInvestor } from "../../../../../modules/auth/selectors";
import { selectEtoOnChainNextStateStartDate } from "../../../../../modules/eto/selectors";
import { TEtoWithCompanyAndContract } from "../../../../../modules/eto/types";
import { selectIsUserVerifiedOnBlockchain } from "../../../../../modules/kyc/selectors";
import { appConnect } from "../../../../../store";
import { appRoutes } from "../../../../appRoutes";
import { etoPublicViewLink } from "../../../../appRouteUtils";
import { Button, ButtonLink } from "../../../../shared/buttons";
import { FormatNumber } from "../../../../shared/formatters/FormatNumber";
import { MoneyNew } from "../../../../shared/formatters/Money";
import {
  ECurrency,
  ENumberInputFormat,
  ENumberOutputFormat,
} from "../../../../shared/formatters/utils";
import { EndTimeWidget } from "../EndTimeWidget";
import { InvestmentProgress } from "./InvestmentProgress";

import * as styles from "./InvestmentWidget.module.scss";

export interface IInvestmentWidgetProps {
  eto: TEtoWithCompanyAndContract;
  isEmbedded: boolean;
}

export interface IInvestmentStatsProps {
  eto: TEtoWithCompanyAndContract;
}

export interface IInvestmentWidgetStateProps {
  isAuthorized: boolean;
  isAllowedToInvest: boolean;
  isInvestor: boolean;
  nextStateDate: Date | undefined;
}

export interface IInvestmentWidgetDispatchProps {
  startInvestmentFlow: () => void;
}

export type TInvestWidgetProps = IInvestmentWidgetProps &
  IInvestmentWidgetStateProps &
  IInvestmentWidgetDispatchProps;

interface IInvestNowButtonProps {
  eto: TEtoWithCompanyAndContract;
  isAuthorized: boolean;
  isAllowedToInvest: boolean;
  isInvestor: boolean;
  startInvestmentFlow: () => void;
  nextStateDate: Date | undefined;
  isEmbedded: boolean;
}

const InvestNowButtonLayout: React.FunctionComponent<IInvestNowButtonProps> = ({
  eto,
  isAuthorized,
  isAllowedToInvest,
  isInvestor,
  startInvestmentFlow,
  nextStateDate,
  isEmbedded,
}) => {
  const investNowButtonSelector = () => {
    if (!isAuthorized) {
      return (
        <ButtonLink
          to={etoPublicViewLink(eto.previewCode, eto.product.jurisdiction)}
          target={isEmbedded ? "_blank" : ""}
          data-test-id="eto-widget-invest-now-button"
        >
          <FormattedMessage id="shared-component.eto-overview.invest-now" />
        </ButtonLink>
      );
    } else if (isAuthorized && isInvestor && isAllowedToInvest) {
      return (
        <Button onClick={startInvestmentFlow} data-test-id={`eto-invest-now-button-${eto.etoId}`}>
          <FormattedMessage id="shared-component.eto-overview.invest-now" />
        </Button>
      );
    } else if (isAuthorized && isInvestor && !isAllowedToInvest) {
      return (
        <ButtonLink
          to={appRoutes.profile}
          data-test-id="eto-overview-settings-update-required-to-invest"
        >
          <FormattedMessage id="shared-component.eto-overview.settings-update-required" />
        </ButtonLink>
      );
    } else {
      return null;
    }
  };

  return !isAuthorized || isInvestor ? (
    <div className={styles.investNowButton}>
      {investNowButtonSelector()}
      <EndTimeWidget endTime={nextStateDate} />
    </div>
  ) : null;
};

const InvestNowButton = compose<TInvestWidgetProps, IInvestmentWidgetProps>(
  appConnect<IInvestmentWidgetStateProps, IInvestmentWidgetDispatchProps, IInvestmentWidgetProps>({
    stateToProps: (state, props) => ({
      isAuthorized: selectIsAuthorized(state.auth),
      isAllowedToInvest: selectIsUserVerifiedOnBlockchain(state),
      isInvestor: selectIsInvestor(state),
      nextStateDate: selectEtoOnChainNextStateStartDate(state, props.eto.previewCode),
    }),
    dispatchToProps: (dispatch, props) => ({
      startInvestmentFlow: () => dispatch(actions.investmentFlow.startInvestment(props.eto.etoId)),
    }),
  }),
)(InvestNowButtonLayout);

const InvestmentStats: React.FunctionComponent<IInvestmentStatsProps> = ({ eto }) => {
  if (!eto.contract) {
    throw new Error("eto.contract cannot be missing at this point");
  } else {
    const totalInvestors = eto.contract.totalInvestment.totalInvestors;
    return (
      <div>
        <div className={styles.header}>
          <div>
            <MoneyNew
              value={eto.contract.totalInvestment.etherTokenBalance}
              inputFormat={ENumberInputFormat.ULPS}
              outputFormat={ENumberOutputFormat.ONLY_NONZERO_DECIMALS}
              valueType={ECurrency.ETH}
            />
            <br />
            <MoneyNew
              value={eto.contract.totalInvestment.euroTokenBalance}
              inputFormat={ENumberInputFormat.ULPS}
              outputFormat={ENumberOutputFormat.ONLY_NONZERO_DECIMALS}
              valueType={ECurrency.EUR_TOKEN}
            />
          </div>
          {process.env.NF_MAY_SHOW_INVESTOR_STATS === "1" && (
            <div>
              <FormattedMessage
                id="shared-component.eto-overview.investors"
                values={{
                  totalInvestors,
                  totalInvestorsAsString: (
                    <FormatNumber
                      value={totalInvestors}
                      outputFormat={ENumberOutputFormat.INTEGER}
                      inputFormat={ENumberInputFormat.FLOAT}
                    />
                  ),
                }}
              />
            </div>
          )}
        </div>
        <InvestmentProgress eto={eto} />
      </div>
    );
  }
};

export const InvestmentWidget: React.FunctionComponent<IInvestmentWidgetProps> = ({
  eto,
  isEmbedded,
}) => (
  <div className={styles.investmentWidget}>
    <InvestmentStats eto={eto} />
    <InvestNowButton eto={eto} isEmbedded={isEmbedded} />
  </div>
);
