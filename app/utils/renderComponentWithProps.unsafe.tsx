import * as React from "react";
import { ComponentEnhancer, renderComponent, withProps } from "recompose";

export function renderComponentWithPropsUnsafe<O, I>(
  Component: React.ComponentType<O & I>,
  propsCreator: (props: I) => O & I,
): ComponentEnhancer<any, any> {
  return renderComponent(withProps<O, I>(propsCreator)(Component));
}
