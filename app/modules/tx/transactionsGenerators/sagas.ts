import { BigNumber } from "bignumber.js";
import { addHexPrefix } from "ethereumjs-util";
import { compareBigNumbers } from "./../../../utils/BigNumberUtils";
import { EInvestmentType } from "./../../investmentFlow/reducer";

import { put, select } from "redux-saga/effects";
import { TGlobalDependencies } from "../../../di/setupBindings";
import { ITxData } from "../../../lib/web3/Web3Manager";
import { IAppState } from "../../../store";
import { actions, TAction } from "../../actions";
import { selectGasPrice } from "../../gas/selectors";
import { selectReadyToInvest } from "../../investmentFlow/selectors";
import { selectEtoById } from "../../public-etos/selectors";
import {
  selectEtherTokenBalance,
  selectICBMLockedEtherBalance,
  selectIsEtherUpgradeTargetSet,
  selectIsEuroUpgradeTargetSet,
} from "../../wallet/selectors";

import { selectEthereumAddressWithChecksum } from "../../web3/selectors";
import { selectICBMLockedEuroTokenBalance } from "./../../wallet/selectors";

export function* generateEuroUpgradeTransaction({ contractsService }: TGlobalDependencies): any {
  const userAddress = yield select((state: IAppState) =>
    selectEthereumAddressWithChecksum(state.web3),
  );
  const gasPrice = yield select((state: IAppState) => selectGasPrice(state.gas));
  const migrationTarget = yield select((state: IAppState) =>
    selectIsEuroUpgradeTargetSet(state.wallet),
  );
  const euroBalance = yield select((state: IAppState) =>
    selectICBMLockedEuroTokenBalance(state.wallet),
  );

  if (!migrationTarget || new BigNumber(euroBalance).equals(0)) {
    throw new Error();
    // TODO: Add no balance error
  }
  const txInput = contractsService.icbmEuroLock.migrateTx().getData();

  const txDetails: Partial<ITxData> = {
    to: contractsService.icbmEuroLock.address,
    from: userAddress,
    data: txInput,
    value: addHexPrefix("0"),
    gasPrice: gasPrice.standard,
  };
  const estimatedGas = yield contractsService.icbmEuroLock.migrateTx().estimateGas(txDetails);
  txDetails.gas = addHexPrefix(new BigNumber(estimatedGas).toString(16));

  yield put(actions.txSender.txSenderAcceptDraft(txDetails as ITxData));
}

export function* generateEtherUpgradeTransaction({ contractsService }: TGlobalDependencies): any {
  const userAddress = yield select((state: IAppState) =>
    selectEthereumAddressWithChecksum(state.web3),
  );
  const gasPrice = yield select((state: IAppState) => selectGasPrice(state.gas));
  const migrationTarget = yield select((state: IAppState) =>
    selectIsEtherUpgradeTargetSet(state.wallet),
  );
  const etherBalance = yield select((state: IAppState) =>
    selectICBMLockedEtherBalance(state.wallet),
  );

  if (!migrationTarget || new BigNumber(etherBalance).equals(0)) {
    throw new Error();
    // TODO: Add no balance error
  }
  const txInput = contractsService.icbmEtherLock.migrateTx().getData();

  const txDetails: Partial<ITxData> = {
    to: contractsService.icbmEtherLock.address,
    from: userAddress,
    data: txInput,
    value: addHexPrefix("0"),
    gasPrice: gasPrice.standard,
  };

  const estimateGas = yield contractsService.icbmEtherLock.migrateTx().estimateGas(txDetails);
  txDetails.gas = addHexPrefix(new BigNumber(estimateGas).toString(16));

  yield put(actions.txSender.txSenderAcceptDraft(txDetails as ITxData));
}

export function* generateInvestmentTransaction({ contractsService }: TGlobalDependencies): any {
  const state: IAppState = yield select();
  const i = state.investmentFlow;
  const eto = selectEtoById(state.publicEtos, i.etoId);

  if (!eto || !selectReadyToInvest(i)) {
    throw new Error("Investment data is not valid to create an Transaction");
  }

  let txDetails: ITxData | undefined;
  if (i.investmentType === EInvestmentType.InvestmentWallet) {
    const etherTokenBalance = state.wallet.data!.etherTokenBalance;

    // transaction can be fully covered by etherTokens
    if (compareBigNumbers(etherTokenBalance, i.ethValueUlps) >= 0) {
      // need to call 3 args version of transfer method. See the abi in the contract.
      // so we call the rawWeb3Contract directly
      const txInput = contractsService.etherToken.rawWeb3Contract.transfer[
        "address,uint256,bytes"
      ].getData(eto.etoId, i.ethValueUlps, "");

      txDetails = {
        to: contractsService.etherToken.address,
        from: selectEthereumAddressWithChecksum(state.web3),
        data: txInput,
        value: "0",
        gas: i.gasAmount,
        gasPrice: i.gasPrice,
      };

      // fill up etherToken with ether from wallet
    } else {
      const ethVal = new BigNumber(i.ethValueUlps);
      const difference = ethVal.sub(etherTokenBalance);
      const txCall = contractsService.etherToken.depositAndTransferTx(eto.etoId, ethVal, [""]);
      txDetails = {
        to: contractsService.etherToken.address,
        from: selectEthereumAddressWithChecksum(state.web3),
        data: txCall.getData(),
        value: difference.round().toString(),
        gas: i.gasAmount,
        gasPrice: i.gasPrice,
      };
    }
  }

  if (txDetails) {
    yield put(actions.txSender.txSenderAcceptDraft(txDetails));
  }
}

export function* generateEthWithdrawTransaction(
  { contractsService }: TGlobalDependencies,
  action: TAction,
): any {
  if (action.type !== "TX_SENDER_ACCEPT_DRAFT") return;

  const txStateDetails = action.payload;

  let txDetails: ITxData | undefined;
  if (!txStateDetails) return;
  const etherTokenBalance = yield select((s: IAppState) => selectEtherTokenBalance(s.wallet));
  const from = yield select((s: IAppState) => selectEthereumAddressWithChecksum(s.web3));

  // transaction can be fully covered by etherTokens

  const txInput = contractsService.etherToken
    .withdrawAndSendTx(txStateDetails.to, new BigNumber(txStateDetails.value))
    .getData();
  const ethVal = new BigNumber(txStateDetails.value);
  const difference = ethVal.sub(etherTokenBalance);

  txDetails = {
    to: contractsService.etherToken.address,
    from,
    data: txInput,
    value: difference.comparedTo(0) > 0 ? difference.toString() : "0",
    gas: txStateDetails.gas,
    gasPrice: txStateDetails.gasPrice,
  };

  yield put(actions.txSender.txSenderAcceptDraft(txDetails));
}
