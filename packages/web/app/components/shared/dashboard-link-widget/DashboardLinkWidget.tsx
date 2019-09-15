import * as cn from "classnames";
import * as H from "history";
import * as React from "react";

import { TDataTestId, TTranslatedString, XOR } from "../../../types";
import { makeTid } from "../../../utils/tidUtils";
import { EColumnSpan } from "../../layouts/Container";
import { ButtonArrowRight, ButtonLink } from "../buttons";
import { Panel } from "../Panel";

import * as styles from "./DashboardLinkWidget.module.scss";

interface IProps {
  title: TTranslatedString;
  text: TTranslatedString;
  columnSpan?: EColumnSpan;
}

type TChildrenOrButtonLink = XOR<
  { children: React.ReactNode },
  { to: H.LocationDescriptor; buttonText: TTranslatedString }
>;

export const DashboardLinkWidget: React.FunctionComponent<
  IProps & TChildrenOrButtonLink & TDataTestId
> = ({ title, text, to, buttonText, columnSpan, children, "data-test-id": dataTestId }) => (
  <Panel headerText={title} columnSpan={columnSpan} data-test-id={dataTestId}>
    <div className={styles.content}>
      <p className={cn(styles.text, "pt-2")}>{text}</p>
      <div className="d-flex justify-content-center">
        {to && buttonText ? (
          <ButtonLink
            to={to}
            component={ButtonArrowRight}
            data-test-id={makeTid(dataTestId, "call-to-action")}
          >
            {buttonText}
          </ButtonLink>
        ) : (
          children
        )}
      </div>
    </div>
  </Panel>
);
