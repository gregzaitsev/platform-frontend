import { put, select } from "redux-saga/effects";

import { ipfsLinkFromHash } from "../../../../../components/documents/utils";
import { TGlobalDependencies } from "../../../../../di/setupBindings";
import { EEtoState } from "../../../../../lib/api/eto/EtoApi.interfaces.unsafe";
import { ETOCommitment } from "../../../../../lib/contracts/ETOCommitment";
import { ITxData } from "../../../../../lib/web3/types";
import { IAppState } from "../../../../../store";
import { EthereumAddressWithChecksum } from "../../../../../types";
import { assertNever } from "../../../../../utils/assertNever";
import { nonNullable } from "../../../../../utils/nonNullable";
import { actions } from "../../../../actions";
import { InvalidETOStateError } from "../../../../eto/errors";
import { selectSignedInvestmentAgreementHash } from "../../../../eto/selectors";
import { EETOStateOnChain, TEtoWithCompanyAndContract } from "../../../../eto/types";
import { isOnChain } from "../../../../eto/utils";
import { selectStandardGasPriceWithOverHead } from "../../../../gas/selectors";
import { selectNomineeEtoWithCompanyAndContract } from "../../../../nominee-flow/selectors";
import { neuCall } from "../../../../sagasUtils";
import { selectEthereumAddressWithChecksum } from "../../../../web3/selectors";
import { selectTxType } from "../../../sender/selectors";
import { ETxSenderType } from "../../../types";
import { EAgreementType, IAgreementContractAndHash } from "./types";

export function* getAgreementContractAndHash(
  { contractsService }: TGlobalDependencies,
  agreementType: EAgreementType,
  eto: TEtoWithCompanyAndContract,
): Iterator<any> {
  if (!isOnChain(eto)) {
    throw new InvalidETOStateError(eto.state, EEtoState.ON_CHAIN);
  }

  switch (agreementType) {
    case EAgreementType.RAAA: {
      const contract: ETOCommitment = yield contractsService.getETOCommitmentContract(eto.etoId);
      return {
        contract,
        currentAgreementHash: eto.templates.reservationAndAcquisitionAgreement.ipfsHash,
      };
    }
    case EAgreementType.THA: {
      const etoCommitmentContract: ETOCommitment = yield contractsService.getETOCommitmentContract(
        eto.etoId,
      );
      const equityTokenAddress: string = yield etoCommitmentContract.equityToken;

      const contract = yield contractsService.getEquityToken(equityTokenAddress);
      return {
        contract,
        currentAgreementHash: eto.templates.companyTokenHolderAgreement.ipfsHash,
      };
    }
    case EAgreementType.ISHA: {
      throw new Error("ISHA signing flow is handled separately");
    }
    default:
      return assertNever(agreementType, `Unexpected agreement type (${agreementType})`);
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
    getAgreementContractAndHash,
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
  const transactionType: ReturnType<typeof selectTxType> = yield select(selectTxType);

  if (
    transactionType !== ETxSenderType.NOMINEE_THA_SIGN &&
    transactionType !== ETxSenderType.NOMINEE_RAAA_SIGN
  ) {
    throw new Error("Invalid transaction type for nominee agreements signing");
  }

  const generatedTxDetails = yield neuCall(generateNomineeSignAgreementTx, transactionType);
  yield put(actions.txSender.setTransactionData(generatedTxDetails));

  yield put(
    actions.txSender.txSenderContinueToSummary<
      ETxSenderType.NOMINEE_RAAA_SIGN | ETxSenderType.NOMINEE_THA_SIGN
    >(undefined),
  );
}

export function* generateSignInvestmentAgreementTx({
  contractsService,
  web3Manager,
}: TGlobalDependencies): Iterator<any> {
  const nomineeEto: TEtoWithCompanyAndContract = yield nonNullable(
    select(selectNomineeEtoWithCompanyAndContract),
  );

  // Only allowed in `Signing` on chain state
  if (!isOnChain(nomineeEto) || nomineeEto.contract.timedState !== EETOStateOnChain.Signing) {
    throw new InvalidETOStateError(nomineeEto.state, EEtoState.ON_CHAIN);
  }

  const agreementLink = yield select((state: IAppState) =>
    selectSignedInvestmentAgreementHash(state, nomineeEto.previewCode),
  );

  if (agreementLink === undefined) {
    throw new Error("Agreement hash should be defined to sign by nominee");
  }

  const contract: ETOCommitment = yield contractsService.getETOCommitmentContract(nomineeEto.etoId);

  const userAddress: EthereumAddressWithChecksum = yield select(selectEthereumAddressWithChecksum);
  const gasPriceWithOverhead: string = yield select(selectStandardGasPriceWithOverHead);

  const txData: string = yield contract
    .nomineeConfirmsInvestmentAgreementTx(agreementLink)
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

export function* nomineeSignInvestmentAgreementGenerator(_: TGlobalDependencies): Iterator<any> {
  const generatedTxDetails = yield neuCall(generateSignInvestmentAgreementTx);
  yield put(actions.txSender.setTransactionData(generatedTxDetails));
  yield put(actions.txSender.txSenderContinueToSummary<ETxSenderType.NOMINEE_ISHA_SIGN>(undefined));
}
