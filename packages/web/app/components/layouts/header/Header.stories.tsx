import { storiesOf } from "@storybook/react";
import * as React from "react";

import { EUserType } from "../../../lib/api/users/interfaces";
import { IAppState } from "../../../store";
import { DeepPartial } from "../../../types";
import { withStore } from "../../../utils/storeDecorator.unsafe";
import { HeaderAuthorized, HeaderUnauthComponent } from "./Header";

const authStoreInvestor = {
  auth: {
    jwt: "asdf",
    user: {
      type: EUserType.INVESTOR,
      verifiedEmail: "asfasdf@asdf.de",
    },
  },
};

const authStoreIssuer = {
  auth: {
    jwt: "asdf",
    user: {
      type: EUserType.ISSUER,
      verifiedEmail: "asfasdf@asdf.de",
    },
  },
};

storiesOf("Layout/Header for investor", module)
  .addDecorator(withStore(authStoreInvestor as DeepPartial<IAppState>))
  .add("default", () => (
    <>
      <HeaderAuthorized />
    </>
  ));

storiesOf("Layout/Header for issuer", module)
  .addDecorator(withStore(authStoreIssuer as DeepPartial<IAppState>))
  .add("default", () => (
    <>
      <HeaderAuthorized />
    </>
  ));

storiesOf("Layout/Header unauthorized", module)
  .add("with buttons", () => (
    <>
      <HeaderUnauthComponent hideHeaderCtaButtons={false} isIssuerLocation={false} />
    </>
  ))
  .add("without buttons", () => (
    <>
      <HeaderUnauthComponent hideHeaderCtaButtons={true} isIssuerLocation={false} />
    </>
  ));
