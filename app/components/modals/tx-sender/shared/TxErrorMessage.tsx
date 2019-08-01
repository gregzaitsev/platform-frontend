import * as React from "react";

import * as styles from "./TxErrorMessage.module.scss";

const TxErrorMessage: React.FunctionComponent = ({ children }) => (
  <div className={styles.errorMessage}>{children}</div>
);

export { TxErrorMessage };
