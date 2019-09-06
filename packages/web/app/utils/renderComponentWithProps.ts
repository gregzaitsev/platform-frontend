import { renderComponent, withProps } from "recompose";

export const renderComponentWithProps = (props, Component) =>
  renderComponent(
    withProps(props)(Component)
    )
