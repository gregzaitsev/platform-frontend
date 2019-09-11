import BigNumber from "bignumber.js";
import { put, select, take } from "redux-saga/effects";

import { TGlobalDependencies } from "../../../../di/setupBindings";
import { IERC223Token } from "../../../../lib/contracts/IERC223Token";
import { ITxData } from "../../../../lib/web3/types";
import { EthereumAddressWithChecksum } from "../../../../types";
import { selectStandardGasPriceWithOverHead } from "../../../gas/selectors";
import { selectEthereumAddressWithChecksum } from "../../../web3/selectors";
import { isAddressValid } from "../../../web3/utils";
import { WrongValuesError } from "../errors";
import { neuCall } from "../../../sagasUtils";

export interface IWithdrawTxGenerator {
  tokenAddress: EthereumAddressWithChecksum;
  to: EthereumAddressWithChecksum;
  valueUlps: string;
}

function* isERC223TransferIsSupported(
  { contractsService, web3Manager }: TGlobalDependencies,
  to: EthereumAddressWithChecksum,
): Iterator<any> {
  try {
    const isSmartcontract = yield web3Manager.internalWeb3Adapter.isSmartContract(to);
    if (!isSmartcontract) return false;

    const data = contractsService.etherToken.rawWeb3Contract.transfer[
      "address,uint256,bytes"
    ].getData(to, "100", "");
    yield web3Manager.estimateGas({ to, data });
    return true;
  } catch (e) {
    return false;
  }
}

export function* generateTokenWithdrawTransaction(
  { contractsService, web3Manager }: TGlobalDependencies,
  { tokenAddress, to, valueUlps }: IWithdrawTxGenerator,
): any {
  // Sanity checks
  if (!to || !isAddressValid(to) || !valueUlps) throw new WrongValuesError();
  const contractInstance: IERC223Token = yield contractsService.getERC223(tokenAddress);

  const valueBigNumber = new BigNumber(valueUlps);
  if (valueBigNumber.isNegative() && !valueBigNumber.isInteger()) throw new WrongValuesError();

  const from: string = yield select(selectEthereumAddressWithChecksum);
  const gasPriceWithOverhead = yield select(selectStandardGasPriceWithOverHead);

  const isERC223Supported = yield neuCall(isERC223TransferIsSupported, to);
  const txInput = isERC223Supported
    ? contractInstance.rawWeb3Contract.transfer["address,uint256,bytes"].getData(
        to,
        valueBigNumber.toString(),
        "",
      )
    : contractInstance.transferTx(to, valueBigNumber).getData();

  const txDetails: Partial<ITxData> = {
    to: tokenAddress,
    from,
    data: txInput,
    value: "0",
    gasPrice: gasPriceWithOverhead,
  };

  const estimatedGasWithOverhead = yield web3Manager.estimateGasWithOverhead(txDetails);
  return {
    ...txDetails,
    estimatedGasWithOverhead,
  };
}
