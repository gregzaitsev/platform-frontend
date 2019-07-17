import { compose } from "recompose";
import * as React from 'react';
import { withContainer } from "../../utils/withContainer.unsafe";
import { Layout } from "../layouts/Layout";

const NomineeDashboardLayout = () => {
  return <>
  nominee dashboard
  </>
};

export const NomineeDashboard = compose(
  withContainer(Layout),
)(NomineeDashboardLayout);
