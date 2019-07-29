import { renderComponent, withProps } from "recompose";
import * as React from "react";

export function renderComponentWithProps<O, I>(Component: React.ComponentType<O & I>, propsCreator: (props: I) => O & I) {
  return renderComponent(
    withProps<O, I>(propsCreator)(Component))
}
