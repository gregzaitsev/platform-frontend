import * as React from "react";

import { getInvestmentAmount, getShareAndTokenPrice } from "../../../lib/api/eto/EtoUtils";
import { TEtoWithCompanyAndContract } from "../../../modules/eto/types";
import { MoneyRange } from "../../shared/formatters/MoneyRange";
import {
  EAbbreviatedNumberOutputFormat,
  ECurrency,
  ENumberInputFormat,
} from "../../shared/formatters/utils";
import { ToBeAnnounced } from "./ToBeAnnouncedTooltip";

type TExternalProps = {
  etoData: TEtoWithCompanyAndContract;
};

const InvestmentAmount: React.FunctionComponent<TExternalProps> = ({ etoData }) => {
  const { sharePrice } = getShareAndTokenPrice(etoData);
  const { minInvestmentAmount, maxInvestmentAmount } = getInvestmentAmount(etoData, sharePrice);

  return (
    <MoneyRange
      valueFrom={minInvestmentAmount}
      valueUpto={maxInvestmentAmount}
      inputFormat={ENumberInputFormat.FLOAT}
      valueType={ECurrency.EUR}
      outputFormat={EAbbreviatedNumberOutputFormat.SHORT}
      defaultValue={<ToBeAnnounced />}
    />
  );
};

export { InvestmentAmount };
