import * as React from "react";

import { ETransactionType } from "../../../../lib/api/analytics-api/interfaces";
import { TExtractTxHistoryFromType } from "../../../../modules/tx-history/types";
import { etoPublicViewByIdLinkLegacy } from "../../../appRouteUtils";
import { DataRow, DataRowSeparator } from "../../../modals/tx-sender/shared/DataRow";
import { ECurrency, ENumberOutputFormat } from "../../../shared/formatters/utils";
import { getIconForCurrency } from "../../../shared/icons/CurrencyIcon";
import { ExternalLink } from "../../../shared/links/ExternalLink";
import { ETextPosition, ETheme, MoneySuiteWidget } from "../../../shared/MoneySuiteWidget";
import { ESize } from "../../../shared/TransactionData";
import { BasicTransactionDetails } from "./BasicTransactionDetails";

interface IExternalProps {
  transaction: TExtractTxHistoryFromType<ETransactionType.ETO_TOKENS_CLAIM>;
}

const EtoTokensClaimTransactionDetails: React.FunctionComponent<IExternalProps> = ({
  transaction,
}) => (
  <>
    <p>
      <ExternalLink href={etoPublicViewByIdLinkLegacy(transaction.etoId)}>
        View Company Profile
      </ExternalLink>
    </p>

    <BasicTransactionDetails transaction={transaction} />

    <DataRowSeparator />

    <DataRow
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

    <DataRowSeparator />

    <DataRow
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

export { EtoTokensClaimTransactionDetails };
