import { storiesOf } from "@storybook/react";
import * as React from "react";

import { appRoutes } from "../../appRoutes";
import { ButtonArrowRight, ButtonGroup, ButtonLink } from "../buttons";
import { DashboardLinkWidget } from "./DashboardLinkWidget";

storiesOf("DashboardLinkWidget", module)
  .add("default (with 'to' and 'buttonText')", () => (
    <DashboardLinkWidget
      title="title1"
      text="this description is meant for testing purposes"
      to="/"
      buttonText="Random text"
    />
  ))
  .add("with children", () => (
    <DashboardLinkWidget title="title1" text="this description is meant for testing purposes">
      <ButtonGroup>
        <ButtonLink to={appRoutes.documents} component={ButtonArrowRight}>
          Summary
        </ButtonLink>
        <ButtonLink to={appRoutes.documents} component={ButtonArrowRight}>
          Upload
        </ButtonLink>
      </ButtonGroup>
    </DashboardLinkWidget>
  ));
