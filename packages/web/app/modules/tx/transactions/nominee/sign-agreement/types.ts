import { IEquityToken } from "../../../../../lib/contracts/IEquityToken";
import { IETOCommitment } from "../../../../../lib/contracts/IETOCommitment";

export enum EAgreementType {
  RAAA = "raaa",
  THA = "tha",
}

export interface IAgreementContractAndHash {
  contract: IEquityToken | IETOCommitment;
  currentAgreementHash: string;
}
