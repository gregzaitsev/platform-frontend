import * as React from "react";

import { ETransactionType } from "../../../../lib/api/analytics-api/interfaces";
import { TTxHistory } from "../../../../modules/tx-history/types";
import { etoPublicViewByIdLinkLegacy } from "../../../appRouteUtils";
import { DataRow } from "../../../modals/tx-sender/shared/DataRow";
import { ECurrency, ENumberOutputFormat } from "../../../shared/formatters/utils";
import { getIconForCurrency } from "../../../shared/icons/CurrencyIcon";
import { ExternalLink } from "../../../shared/links/ExternalLink";
import { ETextPosition, ETheme, MoneySuiteWidget } from "../../../shared/MoneySuiteWidget";
import { ESize } from "../../../shared/TransactionData";
import { BasicTransactionDetails } from "./BasicTransactionDetails";

import * as styles from "../../../modals/tx-sender/withdraw-flow/Withdraw.module.scss";

interface IExternalProps {
  transaction: TTxHistory;
}

const EtoTokensClaimTransactionDetails: React.FunctionComponent<IExternalProps> = ({
  transaction,
}) => {
  if (transaction.type !== ETransactionType.ETO_TOKENS_CLAIM) {
    throw new Error("Only token claim transaction type is allowed");
  }

  return (
    <>
      <p>
        <ExternalLink href={etoPublicViewByIdLinkLegacy(transaction.etoId)}>
          View Company Profile
        </ExternalLink>
      </p>

      <BasicTransactionDetails transaction={transaction} />

      <hr className={styles.separator} />

      <DataRow
        className={styles.withSpacing}
        caption={"Neu Reward"}
        value={
          <MoneySuiteWidget
            icon={getIconForCurrency(ECurrency.NEU)}
            currency={ECurrency.NEU}
            largeNumber={transaction.neuReward}
            value={transaction.neuRewardEur}
            currencyTotal={ECurrency.EUR}
            theme={ETheme.BLACK}
            size={ESize.MEDIUM}
            textPosition={ETextPosition.RIGHT}
            outputFormat={ENumberOutputFormat.ONLY_NONZERO_DECIMALS_ROUND_UP}
          />
        }
      />

      <hr className={styles.separator} />

      <DataRow
        className={styles.withSpacing}
        caption={"Claimed"}
        value={
          <MoneySuiteWidget
            icon={transaction.icon}
            currency={transaction.currency}
            largeNumber={transaction.amount}
            theme={ETheme.BLACK}
            size={ESize.MEDIUM}
            textPosition={ETextPosition.RIGHT}
            outputFormat={ENumberOutputFormat.ONLY_NONZERO_DECIMALS_ROUND_UP}
          />
        }
      />
    </>
  );
};

export { EtoTokensClaimTransactionDetails };
