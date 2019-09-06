import * as React from "react";
import { FormattedMessage } from "react-intl-phraseapp";

import { appRoutes } from "../../../appRoutes";
import { ButtonLink } from "../../../shared/buttons/ButtonLink";

const RegisterNowWidget: React.FunctionComponent<{ isEmbedded: boolean }> = ({ isEmbedded }) => (
  <>
    <div>
      <FormattedMessage id="shared-component.eto-overview.register-cta" />
    </div>
    <ButtonLink
      innerClassName="mt-3"
      to={appRoutes.register}
      data-test-id="logged-out-campaigning-register"
      target={isEmbedded ? "_blank" : ""}
    >
      <FormattedMessage id="shared-component.eto-overview.register" />
    </ButtonLink>
  </>
);

export { RegisterNowWidget };
