import * as cn from "classnames";
import * as React from "react";

import { TDataTestId } from "../../types";
import { makeTid } from "../../utils/tidUtils";

import * as styles from "./TransactionData.module.scss";

enum ESize {
  LARGE = styles.large,
  MEDIUM = styles.medium,
  NORMAL = styles.normal,
}

type TExternalProps = {
  bottom: React.ReactNode;
  top: React.ReactNode;
  size?: ESize;
};

const TransactionData: React.FunctionComponent<TExternalProps & TDataTestId> = ({
  bottom,
  "data-test-id": dataTestId,
  size = ESize.NORMAL,
  top,
}) => (
  <div className={cn(styles.transactionData, size)}>
    <div className={styles.top} data-test-id={makeTid(dataTestId, "large-value")}>
      {top}
    </div>
    <div className={styles.bottom} data-test-id={makeTid(dataTestId, "value")}>
      {bottom}
    </div>
  </div>
);

export { TransactionData, ESize };
