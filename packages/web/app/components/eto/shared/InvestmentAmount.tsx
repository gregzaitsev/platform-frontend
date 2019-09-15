import * as React from "react";

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
  const minInvestmentAmount = etoData.investmentCalculatedValues
    ? etoData.investmentCalculatedValues.minInvestmentAmount
    : undefined;
  const maxInvestmentAmount = etoData.investmentCalculatedValues
    ? etoData.investmentCalculatedValues.maxInvestmentAmount
    : undefined;
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
