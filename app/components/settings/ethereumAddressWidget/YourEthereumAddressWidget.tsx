import * as React from "react";

import { selectEthereumAddress } from "../../../modules/web3/selectors";
import { appConnect } from "../../../store";
import { EthereumAddress } from "../../../types";
import { PanelDark } from "../../shared/PanelDark";

import { FormattedMessage } from "react-intl-phraseapp";
import * as ethIcon from "../../../assets/img/eth_icon.svg";
import * as styles from "./YourEthereumAddressWidget.module.scss";

interface IStateProps {
  address: EthereumAddress;
}

export const YourEthereumAddressWidgetComponent: React.SFC<IStateProps> = ({ address }) => (
  <PanelDark
    headerText={<FormattedMessage id="your-ethereum-address-widget.header" />}
    rightComponent={<img src={ethIcon} />}
  >
    <div className={styles.panelBody} data-test-id="your-ether-address-widget-eth-address">
      {address}
    </div>
  </PanelDark>
);

export const YourEthereumAddressWidget = appConnect<IStateProps>({
  stateToProps: s => ({
    address: selectEthereumAddress(s.web3),
  }),
})(YourEthereumAddressWidgetComponent);
