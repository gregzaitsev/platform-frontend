import * as cn from "classnames";
import * as React from "react";

import { TDataTestId } from "../../../../types";

import * as styles from "./DataRow.module.scss";

interface IDataRowProps {
  caption: React.ReactNode;
  value: React.ReactNode;
  className?: string;
}

/* This is similar component to InfoRow, but it's not utilize Lists */
export const DataRow: React.FunctionComponent<IDataRowProps & TDataTestId> = ({
  caption,
  value,
  "data-test-id": dataTestId,
  className,
}) => (
  <section className={cn(styles.section, className)}>
    {caption}
    <span data-test-id={dataTestId}>{value}</span>
  </section>
);
