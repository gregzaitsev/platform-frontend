import * as cn from "classnames";
import * as React from "react";

import { TDataTestId, TTranslatedString } from "../../types";
import { MoneyNew } from "./formatters/Money";
import { ECurrency, ENumberInputFormat, ENumberOutputFormat } from "./formatters/utils";
import { ESize as ETransactionDataSize, TransactionData } from "./TransactionData";

import * as styles from "./MoneySuiteWidget.module.scss";

enum ETheme {
  FRAMED = styles.framed,
}

enum ESize {
  LARGE = styles.large,
  NORMAL = styles.normal,
}

interface IMoneySuiteWidgetProps {
  icon: string;
  currency: ECurrency;
  currencyTotal: ECurrency;
  largeNumber: string;
  value: string;
  percentage?: string;
  theme?: ETheme;
  size?: ESize;
  walletName?: TTranslatedString;
}

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
}) => (
  <div className={cn(styles.moneySuiteWidget, theme, size)}>
    <div>
      <img className={styles.icon} src={icon} alt="" />
      {walletName}
    </div>
    <TransactionData
      size={size === ESize.LARGE ? ETransactionDataSize.LARGE : undefined}
      data-test-id={dataTestId}
      top={
        <MoneyNew
          value={largeNumber}
          inputFormat={ENumberInputFormat.ULPS}
          outputFormat={ENumberOutputFormat.ONLY_NONZERO_DECIMALS}
          valueType={currency}
        />
      }
      bottom={
        <>
          ={" "}
          <MoneyNew
            value={value}
            inputFormat={ENumberInputFormat.ULPS}
            outputFormat={ENumberOutputFormat.ONLY_NONZERO_DECIMALS}
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
