import { put, select } from "redux-saga/effects";

import { TGlobalDependencies } from "../../../../di/setupBindings";
import { ETOCommitment } from "../../../../lib/contracts/ETOCommitment";
import { ITxData } from "../../../../lib/web3/types";
import { IAppState } from "../../../../store";
import { EthereumAddressWithChecksum } from "../../../../types";
import { multiplyBigNumbers } from "../../../../utils/BigNumberUtils";
import { actions } from "../../../actions";
import { selectEtoWithCompanyAndContractById } from "../../../eto/selectors";
import { selectStandardGasPriceWithOverHead } from "../../../gas/selectors";
import { selectInvestorTicket } from "../../../investor-portfolio/selectors";
import { IInvestorTicket } from "../../../investor-portfolio/types";
import { neuCall } from "../../../sagasUtils";
import { selectEtherPriceEur } from "../../../shared/tokenPrice/selectors";
import { selectEthereumAddressWithChecksum } from "../../../web3/selectors";
import { selectTxGasCostEthUlps } from "../../sender/selectors";
import { ETxSenderType } from "../../types";

export function* generateGetRefundTransaction(
  { contractsService, web3Manager }: TGlobalDependencies,
  etoId: string,
): Iterator<any> {
  const userAddress: EthereumAddressWithChecksum = yield select(selectEthereumAddressWithChecksum);
  const gasPriceWithOverhead: string = yield select(selectStandardGasPriceWithOverHead);

  const etoContract: ETOCommitment = yield contractsService.getETOCommitmentContract(etoId);
  const txInput = etoContract.refundTx().getData();

  const txInitialDetails = {
    to: etoContract.address,
    from: userAddress,
    data: txInput,
    value: "0",
    gasPrice: gasPriceWithOverhead,
  };

  const estimatedGasWithOverhead: string = yield web3Manager.estimateGasWithOverhead(
    txInitialDetails,
  );

  const txDetails: ITxData = {
    ...txInitialDetails,
    gas: estimatedGasWithOverhead,
  };

  return txDetails;
}

export function* startRefundGenerator(_: TGlobalDependencies, etoId: string): Iterator<any> {
  const generatedTxDetails: ITxData = yield neuCall(generateGetRefundTransaction, etoId);
  yield put(actions.txSender.setTransactionData(generatedTxDetails));

  const etoData = yield select((state: IAppState) =>
    selectEtoWithCompanyAndContractById(state, etoId),
  );
  const investorTicket: IInvestorTicket = yield select((state: IAppState) =>
    selectInvestorTicket(state, etoId),
  );
  const ethPrice: string = yield select(selectEtherPriceEur);
  const costUlps: string = yield select(selectTxGasCostEthUlps);
  const costEurUlps = multiplyBigNumbers([ethPrice, costUlps]);

  yield put(
    actions.txSender.txSenderContinueToSummary<ETxSenderType.INVESTOR_REFUND>({
      etoId,
      costUlps,
      costEurUlps,
      tokenName: etoData.equityTokenName,
      tokenSymbol: etoData.equityTokenSymbol,
      amountEth: investorTicket.amountEth.toString(),
      amountEurUlps: investorTicket.amountEurUlps.toString(),
      companyName: etoData.company.brandName,
    }),
  );
}
