import * as React from "react";
import { FormattedMessage } from "react-intl-phraseapp";

import { ETxSenderType } from "../../../../modules/tx/types";
import { addBigNumbers, multiplyBigNumbers } from "../../../../utils/BigNumberUtils";
import { FormatNumber } from "../../../shared/formatters/FormatNumber";
import { Money } from "../../../shared/formatters/Money";
import {
  ECurrency,
  ENumberInputFormat,
  ENumberOutputFormat,
  EPriceFormat,
} from "../../../shared/formatters/utils";
import { TooltipBase } from "../../../shared/tooltips";
import { InfoList } from "../shared/InfoList";
import { InfoRow } from "../shared/InfoRow";
import { TimestampRow } from "../shared/TimestampRow";
import { TransactionDetailsComponent } from "../types";
import { getActualTokenPriceEur, getTokenPriceDiscount } from "./utils";

import * as neuIcon from "../../../../assets/img/neu_icon.svg";
import * as info from "../../../../assets/img/notifications/info.svg";
import * as tokenIcon from "../../../../assets/img/token_icon.svg";
import * as styles from "./Summary.module.scss";

const NeuRewardCaption: React.FunctionComponent<{ isIcbm?: boolean }> = ({ isIcbm }) => {
  const neuMsg = <FormattedMessage id="investment-flow.summary.estimated-reward" />;
  const icbmMsg = (
    <>
      {neuMsg}
      <img className={styles.infoIcon} id="tooltip-target-neu" src={info} alt="" />
      <TooltipBase target="tooltip-target-neu">
        <FormattedMessage id="investment-flow.message.no-icbm-neu-reward" />
      </TooltipBase>
    </>
  );
  return isIcbm ? icbmMsg : neuMsg;
};

interface IEquityTockenValue {
  equityTokens: string;
}

interface IEstimatedReward {
  estimatedReward: string;
}

interface IInvestment {
  investmentEur: string;
  investmentEth: string;
}

interface ITokenPriceAndDiscount {
  actualTokenPrice: string;
  discount: string | null;
}

interface ITotal {
  totalCostEur: string;
  totalCostEth: string;
}

const EquityTokensValue: React.FunctionComponent<IEquityTockenValue> = ({ equityTokens }) => (
  <span>
    {/* TODO: Change to actual custom token icon (eto.equityTokenImage)*/}
    <img src={tokenIcon} alt="" />{" "}
    <FormatNumber
      value={equityTokens}
      inputFormat={ENumberInputFormat.FLOAT}
      outputFormat={ENumberOutputFormat.INTEGER}
    />
  </span>
);

const EstimatedRewardValue: React.FunctionComponent<IEstimatedReward> = ({ estimatedReward }) => (
  <span>
    <img src={neuIcon} alt="" />{" "}
    <Money
      value={estimatedReward}
      inputFormat={ENumberInputFormat.ULPS}
      valueType={ECurrency.NEU}
      outputFormat={ENumberOutputFormat.ONLY_NONZERO_DECIMALS}
    />
  </span>
);

const Investment: React.FunctionComponent<IInvestment> = ({ investmentEur, investmentEth }) => (
  <>
    <Money
      data-test-id="euro"
      value={investmentEur}
      inputFormat={ENumberInputFormat.ULPS}
      valueType={ECurrency.EUR}
      outputFormat={ENumberOutputFormat.ONLY_NONZERO_DECIMALS}
    />
    {" ≈ "}
    <Money
      data-test-id="eth"
      value={investmentEth}
      inputFormat={ENumberInputFormat.ULPS}
      valueType={ECurrency.ETH}
      outputFormat={ENumberOutputFormat.ONLY_NONZERO_DECIMALS}
    />
  </>
);

const TokenPriceAndDiscount: React.FunctionComponent<ITokenPriceAndDiscount> = ({
  actualTokenPrice,
  discount,
}) => (
  <>
    <Money
      data-test-id="token-price"
      value={actualTokenPrice}
      inputFormat={ENumberInputFormat.FLOAT}
      valueType={EPriceFormat.EQUITY_TOKEN_PRICE_EURO}
      outputFormat={ENumberOutputFormat.FULL}
    />
    {discount !== null && (
      <>
        {" (-"}
        <FormatNumber
          data-test-id="discount"
          value={discount}
          inputFormat={ENumberInputFormat.FLOAT}
          outputFormat={ENumberOutputFormat.ONLY_NONZERO_DECIMALS}
        />
        {"%)"}
      </>
    )}
  </>
);

const Total: React.FunctionComponent<ITotal> = ({ totalCostEur, totalCostEth }) => (
  <>
    <Money
      data-test-id="total-cost-euro"
      value={totalCostEur}
      inputFormat={ENumberInputFormat.ULPS}
      valueType={ECurrency.EUR}
      outputFormat={ENumberOutputFormat.ONLY_NONZERO_DECIMALS}
    />
    {" ≈ "}
    <Money
      data-test-id="total-cost-eth"
      value={totalCostEth}
      inputFormat={ENumberInputFormat.ULPS}
      valueType={ECurrency.ETH}
      outputFormat={ENumberOutputFormat.ONLY_NONZERO_DECIMALS}
    />
  </>
);

const InvestmentTransactionDetails: TransactionDetailsComponent<ETxSenderType.INVEST> = ({
  additionalData,
  className,
  txTimestamp,
}) => {
  const gasCostEuro = multiplyBigNumbers([additionalData.gasCostEth, additionalData.etherPriceEur]);
  const totalCostEth = addBigNumbers([additionalData.gasCostEth, additionalData.investmentEth]);
  const totalCostEur = addBigNumbers([gasCostEuro, additionalData.investmentEur]);

  const actualTokenPrice = getActualTokenPriceEur(
    additionalData.investmentEur,
    additionalData.equityTokens,
  );

  const fullTokenPrice =
    additionalData.eto.investmentCalculatedValues.sharePrice! /
    additionalData.eto.equityTokensPerShare;

  const discount = getTokenPriceDiscount(fullTokenPrice.toString(), actualTokenPrice);
  return (
    <InfoList className={className}>
      <InfoRow
        caption={<FormattedMessage id="investment-flow.summary.company" />}
        value={additionalData.eto.companyName}
      />
      <InfoRow
        data-test-id="investment-summary-token-price"
        caption={<FormattedMessage id="investment-flow.summary.token-price" />}
        value={<TokenPriceAndDiscount actualTokenPrice={actualTokenPrice} discount={discount} />}
      />
      <InfoRow
        caption={<FormattedMessage id="investment-flow.summary.eto-address" />}
        value={additionalData.eto.etoId}
        data-test-id="investment-flow.summary.eto-address"
      />
      <InfoRow
        caption={<FormattedMessage id="investment-flow.summary.your-investment" />}
        value={
          <Investment
            investmentEth={additionalData.investmentEth}
            investmentEur={additionalData.investmentEur}
          />
        }
        data-test-id="invest-modal-summary-your-investment"
      />
      <InfoRow
        data-test-id="investment-flow.summary.transaction-cost"
        caption={<FormattedMessage id="investment-flow.summary.transaction-cost" />}
        value={
          <Money
            value={additionalData.gasCostEth}
            inputFormat={ENumberInputFormat.ULPS}
            valueType={ECurrency.ETH}
            outputFormat={ENumberOutputFormat.FULL}
          />
        }
      />
      <InfoRow
        data-test-id="investment-flow.summary.equity-tokens"
        caption={<FormattedMessage id="investment-flow.summary.equity-tokens" />}
        value={<EquityTokensValue equityTokens={additionalData.equityTokens} />}
      />
      <InfoRow
        data-test-id="investment-flow.summary.neu-reward"
        caption={<NeuRewardCaption isIcbm={additionalData.isIcbm} />}
        value={<EstimatedRewardValue estimatedReward={additionalData.estimatedReward} />}
      />
      <InfoRow
        data-test-id="investment-flow.summary.transaction-value"
        caption={<FormattedMessage id="investment-flow.summary.transaction-value" />}
        value={<Total totalCostEth={totalCostEth} totalCostEur={totalCostEur} />}
      />

      {txTimestamp && <TimestampRow timestamp={txTimestamp} />}
    </InfoList>
  );
};

export { InvestmentTransactionDetails };
