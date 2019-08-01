import BigNumber from "bignumber.js";
import { put, select, take } from "redux-saga/effects";
import Web3Accounts from "web3-eth-accounts";

import { IWindowWithData } from "../../../../../test/helperTypes";
import {
  ECurrency,
  ENumberInputFormat,
  ERoundingMode,
  selectDecimalPlaces,
  toFixedPrecision,
} from "../../../../components/shared/formatters/utils";
import { Q18 } from "../../../../config/constants";
import { TGlobalDependencies } from "../../../../di/setupBindings";
import { ITxData } from "../../../../lib/web3/types";
import {
  DEFAULT_LOWER_GAS_LIMIT,
  DEFAULT_UPPER_GAS_LIMIT,
} from "../../../../lib/web3/Web3Manager/Web3Manager";
import { IAppState } from "../../../../store";
import {
  compareBigNumbers,
  multiplyBigNumbers,
  subtractBigNumbers,
} from "../../../../utils/BigNumberUtils";
import { convertToBigInt } from "../../../../utils/Number.utils";
import { actions, TActionFromCreator } from "../../../actions";
import { selectStandardGasPriceWithOverHead } from "../../../gas/selectors";
import { neuCall } from "../../../sagasUtils";
import {
  selectEtherTokenBalanceAsBigNumber,
  selectLiquidEtherBalance,
} from "../../../wallet/selectors";
import { selectEthereumAddressWithChecksum } from "../../../web3/selectors";
import {
  selectTxAdditionalData,
  selectTxGasCostEthUlps,
  selectTxGasCostEurUlps,
  selectTxTotalEthUlps,
  selectTxTotalEurUlps,
  selectTxValueEthUlps,
  selectTxValueEurUlps,
} from "../../sender/selectors";
import { ETxSenderType, IWithdrawDraftType } from "../../types";
import { calculateGasLimitWithOverhead, EMPTY_DATA, ETH_ADDRESS_SIZE } from "../../utils";

export function* generateEthWithdrawTransaction(
  { contractsService, web3Manager }: TGlobalDependencies,
  { to, value }: IWithdrawDraftType,
  skipUpdate: boolean = false,
): any {
  const etherTokenBalance: BigNumber = yield select(selectEtherTokenBalanceAsBigNumber);
  const from: string = yield select(selectEthereumAddressWithChecksum);
  const gasPriceWithOverhead = yield select(selectStandardGasPriceWithOverHead);

  const address: string =
    to && to.length === ETH_ADDRESS_SIZE ? to : new Web3Accounts().create().address;

  const weiValue = Q18.mul(value || "0");

  if (etherTokenBalance.isZero()) {
    // transaction can be fully covered ether balance
    const txDetails: Partial<ITxData> = {
      to: address,
      from,
      data: EMPTY_DATA,
      value: weiValue.toString(),
      gasPrice: gasPriceWithOverhead,
      gas: calculateGasLimitWithOverhead(DEFAULT_LOWER_GAS_LIMIT),
    };

    if (process.env.IS_CYPRESS) {
      const { disableNotAcceptingEtherCheck, forceLowGas } = window as IWindowWithData;
      if (disableNotAcceptingEtherCheck) {
        // For the specific test cases return txDetails directly without estimating gas
        return txDetails;
      } else if (forceLowGas) {
        // Return really low gas
        return { ...txDetails, gas: calculateGasLimitWithOverhead(1000) };
      }
    }

    // estimate GAS to have rejection if address is not accepting ETH
    yield web3Manager.estimateGasWithOverhead(txDetails);

    return skipUpdate ? txDetails : yield useMaximumPossibleAmount(txDetails);
  } else {
    // transaction can be fully covered by etherTokens
    const txInput = contractsService.etherToken.withdrawAndSendTx(address, weiValue).getData();

    const difference = weiValue.sub(etherTokenBalance);

    const txDetails: Partial<ITxData> = {
      to: contractsService.etherToken.address,
      from,
      data: txInput,
      value: difference.comparedTo(0) > 0 ? difference.toString() : "0",
      gasPrice: gasPriceWithOverhead,
    };

    if (process.env.IS_CYPRESS) {
      const { disableNotAcceptingEtherCheck, forceLowGas } = window as IWindowWithData;
      if (disableNotAcceptingEtherCheck) {
        // For the specific test cases return txDetails directly without estimating gas
        return { ...txDetails, gas: calculateGasLimitWithOverhead(DEFAULT_UPPER_GAS_LIMIT) };
      } else if (forceLowGas) {
        // Return really low gas
        return { ...txDetails, gas: calculateGasLimitWithOverhead(1000) };
      }
    }

    const estimatedGasWithOverhead = yield web3Manager.estimateGasWithOverhead(txDetails);

    return skipUpdate
      ? { ...txDetails, gas: estimatedGasWithOverhead }
      : yield useMaximumPossibleAmount(
          { ...txDetails, gas: estimatedGasWithOverhead },
          { to: to, value: weiValue },
        );
  }
}

function* useMaximumPossibleAmount(
  txDetails: Partial<ITxData>,
  inputData: { to: string; value: BigNumber } | undefined = undefined,
): Iterator<any> {
  const maxEtherUlps = yield select(selectLiquidEtherBalance);

  const costUlps = multiplyBigNumbers([txDetails.gasPrice!, txDetails.gas!]);
  const valueUlps = subtractBigNumbers([maxEtherUlps, costUlps]);

  const to = inputData ? inputData.to : txDetails.to;
  const value = inputData ? inputData.value : txDetails.value;

  const maxAvailableEtherFixed = toFixedPrecision({
    value: valueUlps,
    decimalPlaces: selectDecimalPlaces(ECurrency.ETH),
    inputFormat: ENumberInputFormat.ULPS,
    roundingMode: ERoundingMode.DOWN,
  });

  const valueFixed = toFixedPrecision({
    value: value || "0",
    decimalPlaces: selectDecimalPlaces(ECurrency.ETH),
    inputFormat: ENumberInputFormat.ULPS,
    roundingMode: ERoundingMode.DOWN,
  });

  if (
    compareBigNumbers(convertToBigInt(valueFixed), convertToBigInt(maxAvailableEtherFixed)) === 0
  ) {
    const newValue = new BigNumber(valueUlps).div(Q18).toString();
    return yield neuCall(generateEthWithdrawTransaction, { to: to, newValue }, true);
  } else {
    return txDetails;
  }
}

export function* ethWithdrawFlow(_: TGlobalDependencies): Iterator<any> {
  const maxEther = yield select(selectLiquidEtherBalance);
  const account = yield new Web3Accounts().create();

  const previousState = yield select((state: IAppState) =>
    selectTxAdditionalData<ETxSenderType.WITHDRAW>(state),
  );

  // Recreate state when user is back from Summary view
  const data = previousState
    ? { to: previousState.to, value: previousState.value }
    : {
        to: account.address,
        value: maxEther.toString(),
      };

  const initialTxDetails = yield neuCall(generateEthWithdrawTransaction, data);

  yield put(actions.txSender.setTransactionData(initialTxDetails));

  const action: TActionFromCreator<typeof actions.txSender.txSenderAcceptDraft> = yield take(
    actions.txSender.txSenderAcceptDraft,
  );

  if (!action.payload.txDraftData) return;

  const txDataFromUser = action.payload.txDraftData;
  const generatedTxDetails = yield neuCall(generateEthWithdrawTransaction, txDataFromUser);
  yield put(actions.txSender.setTransactionData(generatedTxDetails));

  // Internally we represent eth withdraw in two different modes (normal ether withdrawal and ether token withdrawal)
  // in case of ether token withdrawal `to` points to contract address and `value` is empty
  const additionalData = {
    value: Q18.mul(txDataFromUser.value!).toString(),
    to: txDataFromUser.to!,
    cost: yield select(selectTxGasCostEthUlps),
    costEur: yield select(selectTxGasCostEurUlps),
    walletAddress: yield select(selectEthereumAddressWithChecksum),
    amount: yield select(selectTxValueEthUlps),
    amountEur: yield select(selectTxValueEurUlps),
    total: yield select(selectTxTotalEthUlps),
    totalEur: yield select(selectTxTotalEurUlps),
    inputValue: Q18.mul(txDataFromUser.value || "0").toString(),
  };

  yield put(actions.txSender.txSenderContinueToSummary<ETxSenderType.WITHDRAW>(additionalData));
}
