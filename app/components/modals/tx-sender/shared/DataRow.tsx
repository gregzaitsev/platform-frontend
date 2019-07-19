import * as cn from "classnames";
import * as React from "react";

import { CommonHtmlProps, TDataTestId } from "../../../../types";
import { CopyToClipboardButton } from "../../../shared/CopyToClipboardButton";

import * as styles from "./DataRow.module.scss";

interface IDataRowProps {
  caption: React.ReactNode;
  value: React.ReactNode;
  clipboardCopyValue?: string;
}

/* This is similar component to InfoRow, but it's not utilize Lists */
export const DataRow: React.FunctionComponent<IDataRowProps & CommonHtmlProps & TDataTestId> = ({
  caption,
  value,
  clipboardCopyValue,
  "data-test-id": dataTestId,
  className,
}) => (
  <section className={cn(styles.section, className)}>
    {caption}
    <span className={styles.value}>
      <span data-test-id={dataTestId}>{value}</span>
      {clipboardCopyValue && (
        <CopyToClipboardButton
          className={cn(styles.copyToClipboard, "ml-2")}
          value={clipboardCopyValue}
        />
      )}
    </span>
  </section>
);
