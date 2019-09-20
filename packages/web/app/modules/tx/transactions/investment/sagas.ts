import { BigNumber } from "bignumber.js";
import { put, select, take } from "redux-saga/effects";

import { TGlobalDependencies } from "../../../../di/setupBindings";
import { ITxData } from "../../../../lib/web3/types";
import { IAppState } from "../../../../store";
import { compareBigNumbers } from "../../../../utils/BigNumberUtils";
import { actions } from "../../../actions";
import { selectEtoById, selectEtoWithCompanyAndContractById } from "../../../eto/selectors";
import { TEtoWithCompanyAndContract } from "../../../eto/types";
import { selectStandardGasPriceWithOverHead } from "../../../gas/selectors";
import { EInvestmentType } from "../../../investment-flow/reducer";
import {
  selectInvestmentEthValueUlps,
  selectInvestmentEtoId,
  selectInvestmentEurValueUlps,
  selectIsICBMInvestment,
} from "../../../investment-flow/selectors";
import {
  selectEquityTokenCountByEtoId,
  selectNeuRewardUlpsByEtoId,
} from "../../../investor-portfolio/selectors";
import { neuCall } from "../../../sagasUtils";
import { selectEtherPriceEur } from "../../../shared/tokenPrice/selectors";
import { selectEtherTokenBalance } from "../../../wallet/selectors";
import { selectEthereumAddressWithChecksum } from "../../../web3/selectors";
import { selectTxGasCostEthUlps } from "../../sender/selectors";
import { ETxSenderType } from "../../types";
import { selectMaximumInvestment } from "./selectors";

export const INVESTMENT_GAS_AMOUNT = "600000";

function* getEtherTokenTransaction(
  { contractsService }: TGlobalDependencies,
  etoId: string,
): Iterator<any> {
  const etherTokenBalance = yield select(selectEtherTokenBalance);
  const investAmount = yield select((state: IAppState) => state.investmentFlow.ethValueUlps || "0");
  const investAmountUlps = yield select(selectMaximumInvestment);

  if (!etherTokenBalance) {
    throw new Error("No ether Token Balance");
  }

  if (compareBigNumbers(etherTokenBalance, investAmountUlps) >= 0) {
    // transaction can be fully covered by etherTokens

    // Call IERC223 compliant transfer function
    // otherwise ETOCommitment is not aware of any investment
    // TODO: Fix when TypeChain support overloads
    const txInput = contractsService.etherToken.rawWeb3Contract.transfer[
      "address,uint256,bytes"
    ].getData(etoId, investAmountUlps, "");
    return { data: txInput, to: contractsService.etherToken.address };
  } else {
    // fill up etherToken with ether from wallet
    const ethVal = new BigNumber(investAmount);
    const value = ethVal.sub(etherTokenBalance);
    const txCall = contractsService.etherToken.depositAndTransferTx(etoId, ethVal, [""]).getData();

    return { value: value.toString(), data: txCall, to: contractsService.etherToken.address };
  }
}

export function* generateInvestmentTransaction({
  contractsService,
  web3Manager,
}: TGlobalDependencies): any {
  const from: string = yield select(selectEthereumAddressWithChecksum);
  const gasPrice: string = yield select(selectStandardGasPriceWithOverHead);

  const investmentState = yield select((state: IAppState) => state.investmentFlow);
  const { etoId } = yield select((state: IAppState) => selectEtoById(state, investmentState.etoId));

  let data;
  let to;
  let value;
  const investAmountUlps = yield select(selectMaximumInvestment);

  switch (investmentState.investmentType) {
    case EInvestmentType.Eth:
      ({ value, data } = yield neuCall(getEtherTokenTransaction, etoId));
      to = contractsService.etherToken.address;
      break;
    case EInvestmentType.NEur:
      data = yield contractsService.euroToken.rawWeb3Contract.transfer[
        "address,uint256,bytes"
      ].getData(etoId, investAmountUlps, "");
      to = contractsService.euroToken.address;
      break;
    case EInvestmentType.ICBMEth:
      data = yield contractsService.etherLock.transferTx(etoId, investAmountUlps, [""]).getData();
      to = contractsService.etherLock.address;
      break;
    case EInvestmentType.ICBMnEuro:
      data = yield contractsService.euroLock.transferTx(etoId, investAmountUlps, [""]).getData();
      to = contractsService.euroLock.address;
      break;
  }
  const transaction: Partial<ITxData> = {
    to,
    from,
    data,
    value: value || "0",
    gasPrice,
  };

  const gas = yield web3Manager.estimateGasWithOverhead(transaction);

  return { ...transaction, gas };
}

export function* investmentFlowGenerator(_: TGlobalDependencies): any {
  yield take(actions.txSender.txSenderAcceptDraft);

  const etoId: string = yield select(selectInvestmentEtoId);
  const eto: TEtoWithCompanyAndContract = yield select((state: IAppState) =>
    selectEtoWithCompanyAndContractById(state, etoId),
  );

  const investmentEth: string = yield select(selectInvestmentEthValueUlps);
  const investmentEur: string = yield select(selectInvestmentEurValueUlps);
  const gasCostEth: string = yield select(selectTxGasCostEthUlps);
  const equityTokens: string = yield select((state: IAppState) =>
    selectEquityTokenCountByEtoId(state, etoId),
  );
  const estimatedReward: string = yield select((state: IAppState) =>
    selectNeuRewardUlpsByEtoId(state, etoId),
  );

  const etherPriceEur: string = yield select(selectEtherPriceEur);
  const isIcbm: boolean = yield select(selectIsICBMInvestment);

  const additionalData = {
    eto: {
      etoId,
      companyName: eto.company.name,
      existingShareCapital: eto.existingShareCapital,
      equityTokensPerShare: eto.equityTokensPerShare,
      preMoneyValuationEur: eto.preMoneyValuationEur,
      investmentCalculatedValues: eto.investmentCalculatedValues,
    },
    investmentEth,
    investmentEur,
    gasCostEth,
    equityTokens,
    estimatedReward,
    etherPriceEur,
    isIcbm,
  };

  yield put(actions.txSender.txSenderContinueToSummary<ETxSenderType.INVEST>(additionalData));
}
