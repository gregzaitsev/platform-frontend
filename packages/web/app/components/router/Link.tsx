import * as React from "react";
import { appConnect } from "../../store";
import { actions } from "../../modules/actions";
import { ERoute } from "../../modules/ui/reducer";

export const LinkBase = ({to, className, goTo, children}) =>
  <a onClick={() => goTo(to)} className={className}>
    {children}
  </a>

export const Link = appConnect({
  dispatchToProps: dispatch => ({
    goTo: (route:ERoute) => dispatch(actions.ui.goTo(route)),
  })
})(LinkBase)
