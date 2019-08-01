import * as cn from "classnames";
import * as React from "react";

import { TDataTestId, TTranslatedString } from "../../types";
import { MoneyNew } from "./formatters/Money";
import {
  ENumberInputFormat,
  ENumberOutputFormat,
  THumanReadableFormat,
  TValueFormat,
} from "./formatters/utils";
import {
  ESize as ETransactionDataSize,
  ETheme as ETransactionDataTheme,
  TransactionData,
} from "./TransactionData";

import * as styles from "./MoneySuiteWidget.module.scss";

enum ETheme {
  /*
   * @deprecated FRAMED and BLACK should be moved to a separate component
   */
  FRAMED = styles.framed,
  BLACK = styles.black,
}

export enum ETextPosition {
  LEFT = styles.positionLeft,
  RIGHT = styles.positionRight,
}

enum ESize {
  HUGE = styles.huge,
  LARGE = styles.large,
  MEDIUM = styles.medium,
  NORMAL = styles.normal,
}

interface IMoneySuiteWidgetProps {
  icon?: string;
  currency: TValueFormat;
  currencyTotal: TValueFormat;
  largeNumber: string;
  value: string;
  theme?: ETheme;
  size?: ESize;
  /*
   * @deprecated should be moved to a separate component
   */
  walletName?: TTranslatedString;
  textPosition?: ETextPosition;
  outputFormat?: THumanReadableFormat;
  inputFormat?: ENumberInputFormat;
}

interface IMoneySingleSuiteWidgetProps {
  icon: string;
  currency: TValueFormat;
  value?: string;
  theme?: ETheme;
  size?: ESize;
  textPosition?: ETextPosition;
  outputFormat?: THumanReadableFormat;
  inputFormat?: ENumberInputFormat;
}

const getSize = (size: ESize | undefined) => {
  switch (size) {
    case ESize.HUGE:
      return ETransactionDataSize.HUGE;
    case ESize.LARGE:
      return ETransactionDataSize.LARGE;
    case ESize.MEDIUM:
      return ETransactionDataSize.MEDIUM;
    default:
      return undefined;
  }
};

const getTheme = (theme: ETheme | undefined) => {
  switch (theme) {
    case ETheme.BLACK:
      return ETransactionDataTheme.BLACK;
    default:
      return undefined;
  }
};

const Icon: React.FunctionComponent<{ icon?: string; walletName?: TTranslatedString }> = ({
  icon,
  walletName,
}) => (
  <div>
    {icon && <img className={styles.icon} src={icon} alt="" />}
    {walletName}
  </div>
);

const MoneySingleSuiteWidget: React.FunctionComponent<
  IMoneySingleSuiteWidgetProps & TDataTestId
> = ({
  icon,
  currency,
  value,
  "data-test-id": dataTestId,
  theme,
  size,
  textPosition = ETextPosition.LEFT,
  outputFormat = ENumberOutputFormat.ONLY_NONZERO_DECIMALS,
  inputFormat = ENumberInputFormat.ULPS,
}) => (
  <div className={cn(styles.moneySuiteWidget, theme, size, textPosition)}>
    {textPosition === ETextPosition.LEFT && <Icon icon={icon} />}
    <MoneyNew
      data-test-id={dataTestId}
      value={value}
      inputFormat={inputFormat}
      outputFormat={outputFormat}
      valueType={currency}
    />
    {textPosition === ETextPosition.RIGHT && <Icon icon={icon} />}
  </div>
);

const MoneySuiteWidget: React.FunctionComponent<IMoneySuiteWidgetProps & TDataTestId> = ({
  icon,
  currency,
  currencyTotal,
  largeNumber,
  value,
  theme,
  size,
  walletName,
  "data-test-id": dataTestId,
  textPosition = ETextPosition.LEFT,
  outputFormat = ENumberOutputFormat.ONLY_NONZERO_DECIMALS,
  inputFormat = ENumberInputFormat.ULPS,
}) => (
  <div className={cn(styles.moneySuiteWidget, theme, size, textPosition)}>
    {textPosition === ETextPosition.LEFT && <Icon icon={icon} walletName={walletName} />}
    <TransactionData
      size={getSize(size)}
      theme={getTheme(theme)}
      data-test-id={dataTestId}
      top={
        <MoneyNew
          value={largeNumber}
          inputFormat={inputFormat}
          outputFormat={outputFormat}
          valueType={currency}
        />
      }
      bottom={
        <>
          ={" "}
          <MoneyNew
            value={value}
            inputFormat={inputFormat}
            outputFormat={outputFormat}
            valueType={currencyTotal}
          />
        </>
      }
    />
    {textPosition === ETextPosition.RIGHT && <Icon icon={icon} walletName={walletName} />}
  </div>
);

export { ETheme, ESize, IMoneySuiteWidgetProps, MoneySuiteWidget, MoneySingleSuiteWidget };
