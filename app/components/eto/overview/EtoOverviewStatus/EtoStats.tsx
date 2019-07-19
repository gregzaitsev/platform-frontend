import * as cn from "classnames";
import * as React from "react";
import { FormattedMessage } from "react-intl-phraseapp";
import { compose } from "recompose";

import { getShareAndTokenPrice } from "../../../../lib/api/eto/EtoUtils";
import { selectEtoOnChainStateById } from "../../../../modules/eto/selectors";
import { EETOStateOnChain, TEtoWithCompanyAndContract } from "../../../../modules/eto/types";
import { selectIsEligibleToPreEto } from "../../../../modules/investor-portfolio/selectors";
import { appConnect } from "../../../../store";
import { FormatNumber } from "../../../shared/formatters/FormatNumber";
import { MoneyNew } from "../../../shared/formatters/Money";
import {
  ECurrency,
  ENumberInputFormat,
  ENumberOutputFormat,
  EPriceFormat,
} from "../../../shared/formatters/utils";
import { InvestmentAmount } from "../../shared/InvestmentAmount";
import { ToBeAnnounced, ToBeAnnouncedTooltip } from "../../shared/ToBeAnnouncedTooltip";

import * as styles from "./EtoOverviewStatus.module.scss";

function applyDiscountToPrice(price: number, discountFraction: number): number {
  return price * (1 - discountFraction);
}

interface IStateProps {
  tokenPrice: number;
  showWhitelistDiscount: boolean;
  showPublicDiscount: boolean;
}

interface IExternalProps {
  eto: TEtoWithCompanyAndContract;
}

const EtoStatsLayout: React.FunctionComponent<IStateProps & IExternalProps> = ({
  eto,
  tokenPrice,
  showWhitelistDiscount,
  showPublicDiscount,
}) => (
  <div className={cn(styles.etoStatsWrapper, styles.groupWrapper)}>
    <div className={styles.group}>
      <span className={styles.label}>
        <FormattedMessage id="shared-component.eto-overview-status.key-investment-terms" />
        {":"}
      </span>
    </div>
    <div className={styles.group}>
      <span className={styles.label}>
        <FormattedMessage id="shared-component.eto-overview-status.pre-money-valuation" />
      </span>
      <span className={styles.value}>
        <MoneyNew
          className={styles.value}
          value={eto.preMoneyValuationEur}
          inputFormat={ENumberInputFormat.FLOAT}
          valueType={ECurrency.EUR}
          outputFormat={ENumberOutputFormat.INTEGER}
          defaultValue={<ToBeAnnouncedTooltip />}
        />
      </span>
    </div>
    <div className={styles.group}>
      <span className={styles.label}>
        <FormattedMessage id="shared-component.eto-overview-status.investment-amount" />
      </span>
      <span className={styles.value}>
        <InvestmentAmount etoData={eto} />
      </span>
    </div>
    <div className={styles.group}>
      <span className={styles.label}>
        <FormattedMessage id="shared-component.eto-overview-status.new-shares-generated" />
      </span>
      <span className={styles.value}>
        <FormatNumber
          value={eto.newSharesToIssue}
          inputFormat={ENumberInputFormat.FLOAT}
          outputFormat={ENumberOutputFormat.INTEGER}
          defaultValue={<ToBeAnnounced />}
        />
      </span>
    </div>
    <div className={styles.group}>
      <span className={styles.label}>
        <FormattedMessage id="shared-component.eto-overview-status.equity-token-price" />
      </span>
      <span className={styles.value}>
        <MoneyNew
          value={tokenPrice}
          inputFormat={ENumberInputFormat.FLOAT}
          valueType={EPriceFormat.EQUITY_TOKEN_PRICE_EURO}
          outputFormat={ENumberOutputFormat.FULL}
          defaultValue={<ToBeAnnounced />}
        />
        {showWhitelistDiscount && (
          <>
            {" ("}
            <FormattedMessage
              id="shared-component.eto-overview-status.included-discount-percentage"
              values={{ percentage: eto.whitelistDiscountFraction! * 100 }}
            />
            {")"}
          </>
        )}
        {showPublicDiscount && (
          <>
            {" ("}
            <FormattedMessage
              id="shared-component.eto-overview-status.included-discount-percentage"
              values={{ percentage: eto.publicDiscountFraction! * 100 }}
            />
            {")"}
          </>
        )}
      </span>
    </div>
  </div>
);

export const EtoStats = compose<IStateProps & IExternalProps, IExternalProps>(
  appConnect<IStateProps, {}, IExternalProps>({
    stateToProps: (state, props) => {
      let { tokenPrice } = getShareAndTokenPrice(props.eto);
      const isPreEto =
        selectEtoOnChainStateById(state, props.eto.etoId) === EETOStateOnChain.Whitelist;
      const isEligibleToPreEto = selectIsEligibleToPreEto(state, props.eto.etoId);
      const showWhitelistDiscount =
        !!props.eto.whitelistDiscountFraction && isEligibleToPreEto && isPreEto;
      const showPublicDiscount = Boolean(
        !showWhitelistDiscount && props.eto.publicDiscountFraction,
      );

      if (showWhitelistDiscount) {
        tokenPrice = applyDiscountToPrice(tokenPrice, props.eto.whitelistDiscountFraction!);
      }

      if (showPublicDiscount) {
        tokenPrice = applyDiscountToPrice(tokenPrice, props.eto.publicDiscountFraction!);
      }
      return {
        tokenPrice,
        showWhitelistDiscount,
        showPublicDiscount,
      };
    },
  }),
)(EtoStatsLayout);
