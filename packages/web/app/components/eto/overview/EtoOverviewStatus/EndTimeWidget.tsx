import * as React from "react";
import { FormattedRelative } from "react-intl";
import { FormattedMessage } from "react-intl-phraseapp";

import { TimeBasedComponentSwitcher } from "../../shared/TimeBasedComponentSwitcher";

import * as styles from "./EndTimeWidget.module.scss";

interface IExternalProps {
  endTime: Date | undefined;
}

type EEndTimeRunningWidget = {
  endTime: Date;
};

const EndTimeRunningWidget: React.FunctionComponent<EEndTimeRunningWidget> = ({ endTime }) => (
  <span className={styles.endTime} data-test-id="end-time-widget-running">
    <FormattedMessage
      id="shared-component.eto-overview.invest.ends-in"
      values={{
        //initial now is necessary for storybook tests
        endsIn: (
          <FormattedRelative
            value={endTime}
            initialNow={new Date()}
            style="numeric"
            updateInterval={1000}
          />
        ),
      }}
    />
  </span>
);

const EndTimeFinishedWidget: React.FunctionComponent = () => (
  <span className={styles.endTime} data-test-id="end-time-widget-finished">
    <FormattedMessage tagName={"p"} id="shared-component.eto-overview.waiting-for-next-block" />
  </span>
);

const EndTimeWidget: React.FunctionComponent<IExternalProps> = ({ endTime }) => {
  if (!endTime) {
    return null;
  } else {
    return (
      <TimeBasedComponentSwitcher
        endDate={endTime}
        timerRunningComponent={() => <EndTimeRunningWidget endTime={endTime} />}
        timerFinishedComponent={() => <EndTimeFinishedWidget />}
      />
    );
  }
};

export { EndTimeWidget };
