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
   * @deprecated FRAMED should be moved to a separate component
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
  currencyTotal?: TValueFormat;
  largeNumber: string;
  value?: string;
  theme?: ETheme;
  size?: ESize;
  /*
   * @deprecated should be moved to a separate component
   */
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

const Icon: React.FunctionComponent<{ icon: string; walletName?: TTranslatedString }> = ({
  icon,
  walletName,
}) => (
  <div>
    <img className={styles.icon} src={icon} alt="" />
    {walletName}
  </div>
);

const MoneySuiteWidget: React.FunctionComponent<IMoneySuiteWidgetProps & TDataTestId> = ({
  icon,
  currency,
  currencyTotal,
  largeNumber,
  value,
  "data-test-id": dataTestId,
  theme,
  size,
  walletName,
  textPosition = ETextPosition.LEFT,
  outputFormat = ENumberOutputFormat.ONLY_NONZERO_DECIMALS,
}) => (
  <div className={cn(styles.moneySuiteWidget, theme, size, textPosition)}>
    {icon && textPosition === ETextPosition.LEFT && <Icon icon={icon} walletName={walletName} />}
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
        value &&
        currencyTotal && (
          <>
            ={" "}
            <MoneyNew
              value={value}
              inputFormat={ENumberInputFormat.ULPS}
              outputFormat={outputFormat}
              valueType={currencyTotal}
            />
          </>
        )
      }
    />
    {icon && textPosition === ETextPosition.RIGHT && <Icon icon={icon} walletName={walletName} />}
  </div>
);

export { ETheme, ESize, IMoneySuiteWidgetProps, MoneySuiteWidget };
