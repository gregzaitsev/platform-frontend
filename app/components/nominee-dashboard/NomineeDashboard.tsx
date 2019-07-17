import * as React from "react";
import { compose } from "recompose";

import { withContainer } from "../../utils/withContainer.unsafe";
import { Layout } from "../layouts/Layout";

const NomineeDashboardLayout = () => <div data-test-id="nominee-dashboard">nominee dashboard</div>;

export const NomineeDashboard = compose(withContainer(Layout))(NomineeDashboardLayout);
