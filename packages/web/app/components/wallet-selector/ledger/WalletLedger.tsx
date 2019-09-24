import * as React from "react";

import { isSupportingLedger } from "../../../modules/user-agent/reducer";
import { appConnect } from "../../../store";
import { WalletLedgerChooser } from "./WalletLedgerChooser";
import { WalletLedgerInit } from "./WalletLedgerInitComponent";
import { WalletLedgerNotSupported } from "./WalletLedgerNotSupportedComponent";

interface IWalletLedgerStateProps {
  isConnectionEstablished: boolean;
  isLedgerSupported: boolean;
}

export const WalletLedgerComponent: React.FunctionComponent<IWalletLedgerStateProps> = ({
  isConnectionEstablished,
  isLedgerSupported,
}) => {
  if (!isLedgerSupported) {
    return <WalletLedgerNotSupported />;
  } else if (isConnectionEstablished) {
    return <WalletLedgerChooser />;
  } else {
    return <WalletLedgerInit />;
  }
};

export const WalletLedger = appConnect<IWalletLedgerStateProps>({
  stateToProps: state => ({
    isConnectionEstablished: state.ledgerWizardState.isConnectionEstablished,
    isLedgerSupported: isSupportingLedger(state.browser),
  }),
})(WalletLedgerComponent);
