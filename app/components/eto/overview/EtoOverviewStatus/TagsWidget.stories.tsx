import { storiesOf } from "@storybook/react";
import * as React from "react";

import { testEto } from "../../../../../test/fixtures";
import { IEtoDocument } from "../../../../lib/api/eto/EtoFileApi.interfaces";
import { TagsWidgetLayout } from "./TagsWidget";

const defaultProps = {
  downloadDocument: () => {},
  eto: testEto,
  termSheet: {} as IEtoDocument,
  prospectusApproved: {} as IEtoDocument,
  smartContractOnChain: true,
};

storiesOf("ETO/TagsWidget", module).add("default", () => <TagsWidgetLayout {...defaultProps} />);
