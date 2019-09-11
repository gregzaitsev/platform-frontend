import { put, select } from "redux-saga/effects";

import { ipfsLinkFromHash } from "../../../../../components/documents/utils";
import { TGlobalDependencies } from "../../../../../di/setupBindings";
import { ETOCommitment } from "../../../../../lib/contracts/ETOCommitment";
import { ITxData } from "../../../../../lib/web3/types";
import { EthereumAddressWithChecksum } from "../../../../../types";
import { actions } from "../../../../actions";
import { TEtoWithCompanyAndContract } from "../../../../eto/types";
import { isOnChain } from "../../../../eto/utils";
import { selectStandardGasPriceWithOverHead } from "../../../../gas/selectors";
import { selectNomineeEtoWithCompanyAndContract } from "../../../../nominee-flow/selectors";
import { neuCall } from "../../../../sagasUtils";
import { selectEthereumAddressWithChecksum } from "../../../../web3/selectors";
import { selectTxType } from "../../../sender/selectors";
import { ETxSenderType } from "../../../types";
import { EAgreementType, IAgreementContractAndHash } from "./types";

export function* selectAgreementContractAndHash(
  { contractsService }: TGlobalDependencies,
  agreementType: EAgreementType,
  nomineeEto: TEtoWithCompanyAndContract,
): Iterator<any> {
  if (!isOnChain(nomineeEto)) {
    throw new Error(
      `ETO should be on_chain to get agreement details but the status is ${nomineeEto.state}`,
    );
  }

  if (agreementType === EAgreementType.RAAA) {
    const contract = yield contractsService.getETOCommitmentContract(
      nomineeEto.contract.etoCommitmentAddress,
    );
    return {
      contract,
      currentAgreementHash: nomineeEto.templates.reservationAndAcquisitionAgreement.ipfsHash,
    };
  } else if (agreementType === EAgreementType.THA) {
    const etoCommitmentContract: ETOCommitment = yield contractsService.getETOCommitmentContract(
      nomineeEto.contract.etoCommitmentAddress,
    );
    const equityTokenAddress: string = yield etoCommitmentContract.equityToken;

    const contract = yield contractsService.getEquityToken(equityTokenAddress);
    return {
      contract,
      currentAgreementHash: nomineeEto.templates.companyTokenHolderAgreement.ipfsHash,
    };
  } else {
    throw new Error("Unexpected agreement type");
  }
}

export function* generateNomineeSignAgreementTx(
  { web3Manager }: TGlobalDependencies,
  transactionType: ETxSenderType.NOMINEE_RAAA_SIGN | ETxSenderType.NOMINEE_THA_SIGN,
): Iterator<any> {
  const agreementType =
    transactionType === ETxSenderType.NOMINEE_RAAA_SIGN ? EAgreementType.RAAA : EAgreementType.THA;
  const nomineeEto: TEtoWithCompanyAndContract = yield select(
    selectNomineeEtoWithCompanyAndContract,
  );

  const { contract, currentAgreementHash }: IAgreementContractAndHash = yield neuCall(
    selectAgreementContractAndHash,
    agreementType,
    nomineeEto,
  );

  const userAddress: EthereumAddressWithChecksum = yield select(selectEthereumAddressWithChecksum);
  const gasPriceWithOverhead: string = yield select(selectStandardGasPriceWithOverHead);

  const txData: string = yield contract
    .amendAgreementTx(ipfsLinkFromHash(currentAgreementHash))
    .getData();

  const txInitialDetails = {
    to: contract.address,
    from: userAddress,
    data: txData,
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

export function* startNomineeAgreementSign(_: TGlobalDependencies): Iterator<any> {
  const transactionType = yield select(selectTxType);

  const generatedTxDetails = yield neuCall(generateNomineeSignAgreementTx, transactionType);
  yield put(actions.txSender.setTransactionData(generatedTxDetails));

  yield put(actions.txSender.txSenderContinueToSummary<typeof transactionType>(undefined));
}
