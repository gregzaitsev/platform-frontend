import * as React from "react";

import { TDataTestId, TTranslatedString } from "../../../../types";
import { SuccessTick } from "../../../shared/SuccessTick";

import * as styles from "./Message.module.scss";

interface IExternalProps {
  showTick?: boolean;
  title?: TTranslatedString;
  summary?: TTranslatedString;
}

const Message: React.FunctionComponent<IExternalProps & TDataTestId> = ({
  showTick = true,
  title,
  summary,
  "data-test-id": dataTestId,
}) => (
  <section className={styles.widget} data-test-id={dataTestId}>
    {showTick && <SuccessTick />}
    <header className={styles.message}>
      {title && <h5>{title}</h5>}
      {summary && <p>{summary}</p>}
    </header>
  </section>
);

export { Message };
