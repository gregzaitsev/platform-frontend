import * as React from "react";
import { FormattedMessage } from "react-intl-phraseapp";

import { Money } from "../../../../shared/formatters/Money";
import {
  ECurrency,
  ENumberInputFormat,
  ENumberOutputFormat,
} from "../../../../shared/formatters/utils";
import { Message } from "../Message";

type TWhitelistingLimitReached = {
  pledgedAmount: number;
  investorsCount: number;
};

export const WhitelistingLimitReached: React.FunctionComponent<TWhitelistingLimitReached> = ({
  pledgedAmount,
  investorsCount,
}) => (
  <Message
    data-test-id="eto-overview-status-whitelisting-limit-reached"
    showTick={false}
    title={<FormattedMessage id="shared-component.eto-overview.whitelist.success" />}
    summary={
      <FormattedMessage
        id="shared-component.eto-overview.whitelist.success.summary"
        values={{
          totalAmount: (
            <Money
              value={pledgedAmount}
              inputFormat={ENumberInputFormat.FLOAT}
              valueType={ECurrency.EUR}
              outputFormat={ENumberOutputFormat.ONLY_NONZERO_DECIMALS}
            />
          ),
          totalInvestors: investorsCount,
        }}
      />
    }
  />
);
