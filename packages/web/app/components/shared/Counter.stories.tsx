import { storiesOf } from "@storybook/react";
import * as React from "react";

import { CounterLayout } from "./Counter.unsafe";

storiesOf("Counter", module)
  .add("default", () => (
    <CounterLayout computedSeconds={25} computedMinutes={35} computedHours={10} computedDays={88} />
  ))
  .add("blink", () => (
    <CounterLayout
      blink={true}
      computedSeconds={25}
      computedMinutes={35}
      computedHours={10}
      computedDays={88}
    />
  ));
