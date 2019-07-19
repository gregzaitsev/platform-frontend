import * as cn from "classnames";
import * as React from "react";

import { CommonHtmlProps, TDataTestId } from "../../../../types";

import * as styles from "./DataRow.module.scss";

interface IDataRowProps {
  caption: React.ReactNode;
  value: React.ReactNode;
}

/* This is similar component to InfoRow, but it's not utilize Lists */
export const DataRow: React.FunctionComponent<IDataRowProps & CommonHtmlProps & TDataTestId> = ({
  caption,
  value,
  "data-test-id": dataTestId,
  className,
}) => (
  <section className={cn(styles.section, className)}>
    {caption}
    <span className={styles.value} data-test-id={dataTestId}>
      {value}
    </span>
  </section>
);
