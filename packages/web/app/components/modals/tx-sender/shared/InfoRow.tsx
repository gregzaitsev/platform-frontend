import * as cn from "classnames";
import { isString } from "lodash";
import * as React from "react";
import { ListGroupItem } from "reactstrap";

import { TDataTestId, XOR } from "../../../../types";
import { CopyToClipboardButton } from "../../../shared/CopyToClipboardButton";

import * as styles from "./InfoRow.module.scss";

type TInfoRowCommonProps = {
  caption: React.ReactNode;
};

type TInfoRowProps = XOR<
  { allowClipboardCopy: true; value: string },
  { allowClipboardCopy?: false; value: React.ReactNode }
>;

export const InfoRow: React.FunctionComponent<
  TInfoRowCommonProps & TInfoRowProps & TDataTestId
> = ({ caption, value, allowClipboardCopy, "data-test-id": dataTestId }) => (
  <ListGroupItem className={styles.infoRow}>
    <div className={styles.infoCell}>{caption}</div>
    <div className={styles.infoCell}>
      <span data-test-id={dataTestId}>{value}</span>
      {allowClipboardCopy && isString(value) && (
        <CopyToClipboardButton className={cn(styles.copyToClipboard, "ml-2")} value={value} />
      )}
    </div>
  </ListGroupItem>
);
