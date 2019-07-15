import * as cn from "classnames";
import * as React from "react";

import { TDataTestId, TTranslatedString } from "../../types";
import { MoneyNew } from "./formatters/Money";
import {
  ECurrency,
  ENumberInputFormat,
  ENumberOutputFormat,
  THumanReadableFormat,
} from "./formatters/utils";
import {
  ESize as ETransactionDataSize,
  ETheme as ETransactionDataTheme,
  TransactionData,
} from "./TransactionData";

import * as styles from "./MoneySuiteWidget.module.scss";

enum ETheme {
  FRAMED = styles.framed,
  BLACK = styles.black,
}

export enum ETextPosition {
  LEFT = "text-left",
  RIGHT = "text-right",
}

enum ESize {
  HUGE = styles.huge,
  LARGE = styles.large,
  MEDIUM = styles.medium,
  NORMAL = styles.normal,
}

interface IMoneySuiteWidgetProps {
  icon?: string;
  currency: ECurrency;
  currencyTotal: ECurrency;
  largeNumber: string;
  value: string;
  percentage?: string;
  theme?: ETheme;
  size?: ESize;
  walletName?: TTranslatedString;
  textPosition?: ETextPosition;
  outputFormat?: THumanReadableFormat;
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

const MoneySuiteWidget: React.FunctionComponent<IMoneySuiteWidgetProps & TDataTestId> = ({
  icon,
  currency,
  currencyTotal,
  largeNumber,
  value,
  percentage,
  "data-test-id": dataTestId,
  theme,
  size,
  walletName,
  textPosition = ETextPosition.LEFT,
  outputFormat = ENumberOutputFormat.ONLY_NONZERO_DECIMALS,
}) => (
  <div className={cn(styles.moneySuiteWidget, theme, size, textPosition)}>
    {icon && (
      <div>
        <img className={styles.icon} src={icon} alt="" />
        {walletName}
      </div>
    )}
    <TransactionData
      theme={getTheme(theme)}
      size={getSize(size)}
      data-test-id={dataTestId}
      top={
        <MoneyNew
          value={largeNumber}
          inputFormat={ENumberInputFormat.ULPS}
          outputFormat={outputFormat}
          valueType={currency}
        />
      }
      bottom={
        <>
          ={" "}
          <MoneyNew
            value={value}
            inputFormat={ENumberInputFormat.ULPS}
            outputFormat={outputFormat}
            valueType={currencyTotal}
          />
          {percentage && (
            <span className={`${parseInt(percentage, 10) > 0 ? styles.green : styles.red}`}>
              {" "}
              ({percentage}%)
            </span>
          )}
        </>
      }
    />
  </div>
);

export { ETheme, ESize, IMoneySuiteWidgetProps, MoneySuiteWidget };
