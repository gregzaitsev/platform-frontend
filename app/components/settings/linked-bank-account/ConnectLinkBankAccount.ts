import { compose } from "recompose";
import * as React from "react";
import { onEnterAction } from "../../../utils/OnEnterAction";
import { actions } from "../../../modules/actions";
import { appConnect } from "../../../store";
import { selectBankAccount } from "../../../modules/kyc/selectors";
import { selectIsBankAccountVerified } from "../../../modules/bank-transfer-flow/selectors";
import { selectIsUserFullyVerified } from "../../../modules/auth/selectors";
import { EBankTransferType } from "../../../modules/bank-transfer-flow/reducer";
import { DeepReadonly } from "../../../types";
import { TBankAccount } from "../../../modules/kyc/types";

interface IDispatchProps {
  verifyBankAccount: () => void;
}

interface IStateProps {
  bankAccount?: DeepReadonly<TBankAccount>;
  isBankAccountVerified: boolean;
  isUserFullyVerified: boolean;
}

const connectLinkBankAccountComponent =<T extends {}>(
  WrappedComponent: React.ComponentType<IStateProps & IDispatchProps & T>,
) =>

  compose<IStateProps & IDispatchProps & T, T>(
  onEnterAction({
    actionCreator: dispatch => {
      dispatch(actions.kyc.loadBankAccountDetails());
    },
  }),
  appConnect<IStateProps, IDispatchProps, T>({
    stateToProps: state => ({
      bankAccount: selectBankAccount(state),
      isBankAccountVerified: selectIsBankAccountVerified(state),
      isUserFullyVerified: selectIsUserFullyVerified(state),
    }),
    dispatchToProps: dispatch => ({
      verifyBankAccount: () =>
        dispatch(actions.bankTransferFlow.startBankTransfer(EBankTransferType.VERIFY)),
    }),
  }),
)(WrappedComponent);

export { connectLinkBankAccountComponent };
