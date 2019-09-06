import * as React from "react";
import { FormattedMessage } from "react-intl-phraseapp";

import { actions } from "../../modules/actions";
import { selectIsAuthorized } from "../../modules/auth/selectors";
import { appConnect } from "../../store";
import { Button, EButtonLayout } from "../shared/buttons/Button";
import { ExternalLink } from "../shared/links/index";

import * as styles from "./Footer.module.scss";

interface IDispatchProps {
  onDownloadTos: () => void;
}

interface IStateProps {
  isAuthorized: boolean;
}

export const FooterLayout: React.FunctionComponent<IDispatchProps & IStateProps> = ({
  onDownloadTos,
  isAuthorized,
}) => (
  <footer className={styles.footer}>
    <span className={styles.copyright}>©2019 Fifth Force GmbH</span>
    <ExternalLink href="https://neufund.org/imprint" className={styles.link}>
      <FormattedMessage id="footer.links.imprint" />
    </ExternalLink>
    {isAuthorized && (
      <Button layout={EButtonLayout.INLINE} onClick={onDownloadTos} className={styles.link}>
        <FormattedMessage id="footer.links.terms-of-use" />
      </Button>
    )}
    <ExternalLink
      href="https://neufund.org/cms_resources/fifth-force-privacy-policy-2018-11-26.pdf"
      className={styles.link}
    >
      <FormattedMessage id="footer.links.privacy-policy" />
    </ExternalLink>
  </footer>
);

export const Footer = appConnect<IStateProps, IDispatchProps>({
  stateToProps: state => ({
    isAuthorized: selectIsAuthorized(state),
  }),
  dispatchToProps: dispatch => ({
    onDownloadTos: () => dispatch(actions.tosModal.downloadCurrentAgreement()),
  }),
})(FooterLayout);
