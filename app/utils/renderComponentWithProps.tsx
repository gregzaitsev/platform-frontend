import * as React from "react";
import { renderComponent, withProps } from "recompose";

export function renderComponentWithProps<O, I>(Component: React.ComponentType<O & I>, propsCreator: (props: I) => O & I) {
  return renderComponent(
    withProps<O, I>(propsCreator)(Component))
}
