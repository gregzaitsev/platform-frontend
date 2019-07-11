import * as cn from "classnames";
import * as React from "react";
import { FormattedMessage } from "react-intl-phraseapp";

import { CommonHtmlProps, TDataTestId, TTranslatedString } from "../../../types";
import { Panel } from "../Panel";

import * as styles from "./NewTable.module.scss";

enum ENewTableCellLayout {
  TOP = "top",
  MIDDLE = "middle",
  BOTTOM = "bottom",
}

interface INewTableTitle {
  title: TTranslatedString | React.ReactNode;
  width: string;
}

interface INewTableHeader {
  titles: (INewTableTitle | TTranslatedString | React.ReactNode)[];
  titlesVisuallyHidden?: boolean;
}

interface INewTableRow {
  children: React.ReactNode[];
  cellLayout?: ENewTableCellLayout;
  onClick?: (event: React.KeyboardEvent<unknown> | React.MouseEvent<unknown>) => void;
}

interface IPlaceholderTableRow {
  children?: TTranslatedString;
  numberOfCells: number;
}

type INewTableChildren =
  | React.ReactElement<INewTableRow | null>
  | React.ReactElement<INewTableRow | null>[]
  | null;

interface INewTable {
  children: INewTableChildren | INewTableChildren[];
  placeholder?: TTranslatedString;
  className?: string;
  keepRhythm?: boolean;
}

type TProps = INewTable & INewTableHeader;

/**
 * Maps key name to key value
 * see https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/key/Key_Values
 */
export enum Keys {
  ENTER = "Enter",
  SPACE = " ",
}

const useButtonRole = <T extends unknown = unknown>(
  onClick: ((event: React.KeyboardEvent<T> | React.MouseEvent<T>) => void) | undefined,
) =>
  React.useMemo(() => {
    if (onClick) {
      return {
        tabIndex: 0,
        role: "button",
        onClick,
        onKeyDown: (event: React.KeyboardEvent<T>) => {
          // Check to see if space or enter were pressed
          if (event.key === Keys.SPACE || event.key === Keys.ENTER) {
            // Prevent the default action to stop scrolling when space is pressed
            event.preventDefault();
            onClick(event);
          }
        },
      };
    }

    // in case onClick was not provided return empty props
    return {};
  }, [onClick]);

const NewTableRow: React.FunctionComponent<INewTableRow & TDataTestId & CommonHtmlProps> = ({
  children,
  ["data-test-id"]: dataTestId,
  cellLayout,
  className,
  onClick,
}) => {
  const buttonRoleProps = useButtonRole(onClick);

  return (
    <tr className={cn(styles.row, className)} data-test-id={dataTestId} {...buttonRoleProps}>
      {React.Children.toArray(children).map((child, index) => (
        <td className={cn(styles.cell, cellLayout)} key={index}>
          {child}
        </td>
      ))}
    </tr>
  );
};

const PlaceholderTableRow: React.FunctionComponent<IPlaceholderTableRow> = ({
  children,
  numberOfCells,
}) => (
  <tr className={styles.row}>
    <td className={cn(styles.cell, styles.cellPlaceholder)} colSpan={numberOfCells}>
      {children || <FormattedMessage id="shared-components.table.default-placeholder" />}
    </td>
  </tr>
);

const TableLayout: React.FunctionComponent<TProps> = ({
  titles,
  children,
  className,
  placeholder,
  keepRhythm,
  titlesVisuallyHidden,
  ...props
}) => {
  // We have to filter empty nodes in case of any conditional rendering inside table
  const isEmpty = React.Children.toArray(children).filter(React.isValidElement).length === 0;

  return (
    <table
      className={cn(styles.tableWrapper, className, { [styles.tableKeepRhythm]: keepRhythm })}
      {...props}
    >
      <thead className={cn(styles.header, { "sr-only": titlesVisuallyHidden })}>
        <tr className={styles.headerRow}>
          {titles.map((value, index) =>
            value && typeof value === "object" && "width" in value ? (
              <th className={styles.cell} key={index} style={{ width: value.width }}>
                {value.title}
              </th>
            ) : (
              <th className={styles.cell} key={index}>
                {value}
              </th>
            ),
          )}
        </tr>
      </thead>
      <tbody>
        {isEmpty ? (
          <PlaceholderTableRow numberOfCells={titles.length}>{placeholder}</PlaceholderTableRow>
        ) : (
          children
        )}
      </tbody>
    </table>
  );
};

const Table: React.FunctionComponent<TProps> = props => (
  <div className={styles.wrapper}>
    <TableLayout {...props} />
  </div>
);

const NewTable: React.FunctionComponent<TProps> = props => (
  <Panel narrow={true} className={styles.wrapper}>
    <TableLayout {...props} />
  </Panel>
);

export { NewTable, NewTableRow, Table, ENewTableCellLayout };
