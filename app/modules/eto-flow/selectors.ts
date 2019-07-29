import BigNumber from "bignumber.js";
import { createSelector } from "reselect";

import { DEFAULT_DATE_TO_WHITELIST_MIN_DURATION } from "../../config/constants";
import {
  EEtoState,
  TEtoSpecsData,
  TPartialCompanyEtoData,
  TPartialEtoSpecData,
} from "../../lib/api/eto/EtoApi.interfaces.unsafe";
import {
  EEtoDocumentType,
  IEtoDocument,
  TEtoDocumentTemplates,
} from "../../lib/api/eto/EtoFileApi.interfaces";
import {
  EOfferingDocumentType,
  EProductName,
  TEtoProduct,
} from "../../lib/api/eto/EtoProductsApi.interfaces";
import { EKycRequestStatus } from "../../lib/api/KycApi.interfaces";
import { IAppState } from "../../store";
import { DeepReadonly } from "../../types";
import { selectIsUserEmailVerified } from "../auth/selectors";
import { selectBookbuildingStats } from "../bookbuilding-flow/selectors";
import { selectEtoDocumentsLoading } from "../eto-documents/selectors";
import { selectEtoContract } from "../eto/selectors";
import { EETOStateOnChain, TEtoWithCompanyAndContract } from "../eto/types";
import { getEtoSubState } from "../eto/utils";
import { selectIsEligibleToPreEto } from "../investor-portfolio/selectors";
import { selectKycRequestStatus } from "../kyc/selectors";
import { IEtoFlowState } from "./types";
import { isValidEtoStartDate, sortProducts } from "./utils";

export const selectIssuerEtoFlow = (state: IAppState) => state.etoFlow;

export const selectIssuerEto: (state: IAppState) => TEtoSpecsData | undefined = createSelector(
  selectIssuerEtoFlow,
  (state: DeepReadonly<IEtoFlowState>) => state.eto,
);

export const selectIssuerEtoPreviewCode = createSelector(
  selectIssuerEto,
  (eto: TEtoSpecsData | undefined) => (eto ? eto.previewCode : undefined),
);

export const selectIssuerCompany = createSelector(
  selectIssuerEtoFlow,
  (state: DeepReadonly<IEtoFlowState>) => state.company,
);

export const selectIssuerEtoWithCompanyAndContract = (
  state: IAppState,
): TEtoWithCompanyAndContract | undefined => {
  const eto = selectIssuerEto(state);
  const company = selectIssuerCompany(state);

  if (eto && company) {
    const stats = selectBookbuildingStats(state, eto.etoId);
    const isEligibleToPreEto = selectIsEligibleToPreEto(state, eto.etoId);

    const contract = selectEtoContract(state, eto.previewCode);
    const subState = getEtoSubState({ eto, contract, stats, isEligibleToPreEto });

    return {
      ...eto,
      subState,
      company,
      contract,
    };
  }

  return undefined;
};

export const selectIsBookBuilding = (state: IAppState): boolean => {
  const eto = selectIssuerEto(state);

  if (eto) {
    return eto.isBookbuilding;
  }

  return false;
};

export const selectMaxPledges = (state: IAppState) => {
  const eto = selectIssuerEto(state);

  return eto !== undefined ? eto.maxPledges : null;
};

export const selectIssuerEtoId = (state: IAppState): string | undefined => {
  const eto = selectIssuerEto(state);
  if (eto) {
    return eto.etoId;
  }
  return undefined;
};

export const selectCanEnableBookBuilding = (state: IAppState): boolean => {
  const eto = selectIssuerEto(state);

  if (eto) {
    return eto.canEnableBookbuilding;
  }

  return false;
};

export const selectIssuerEtoState = (state: IAppState): EEtoState | undefined => {
  const eto = selectIssuerEto(state);

  if (eto) {
    return eto.state;
  }

  return undefined;
};

export const selectIssuerEtoProduct = (state: IAppState): TEtoProduct | undefined => {
  const eto = selectIssuerEto(state);

  if (eto) {
    return eto.product;
  }

  return undefined;
};

export const selectIssuerEtoOfferingDocumentType = (
  state: IAppState,
): EOfferingDocumentType | undefined => {
  const eto = selectIssuerEto(state);

  if (eto) {
    return eto.product.offeringDocumentType;
  }

  return undefined;
};

export const selectIssuerEtoDateToWhitelistMinDuration = (state: IAppState): BigNumber => {
  const eto = selectIssuerEto(state);
  // in case of undefined return platform default (7 days)
  return new BigNumber(
    eto ? eto.product.dateToWhitelistMinDuration : DEFAULT_DATE_TO_WHITELIST_MIN_DURATION,
  );
};

export const selectIssuerEtoLoading = (state: IAppState): boolean => state.etoFlow.loading;

export const selectNewEtoDateSaving = (state: IAppState): boolean => state.etoFlow.etoDateSaving;

export const selectCombinedEtoCompanyData = (
  state: IAppState,
): TPartialEtoSpecData & TPartialCompanyEtoData => ({
  ...selectIssuerCompany(state),
  ...selectIssuerEto(state),
});

export const selectIssuerEtoTemplates = (state: IAppState): TEtoDocumentTemplates | undefined => {
  const eto = selectIssuerEto(state);

  if (eto) {
    return eto.templates;
  }

  return undefined;
};

export const selectIssuerEtoDocuments = (state: IAppState): TEtoDocumentTemplates | undefined => {
  const eto = selectIssuerEto(state);

  if (eto) {
    return eto.documents;
  }

  return undefined;
};

export const selectIsTermSheetSubmitted = (state: IAppState): boolean | undefined => {
  const documents = selectIssuerEtoDocuments(state);

  if (documents) {
    return Object.keys(documents).some(key => documents[key].documentType === "signed_termsheet");
  }
  return undefined;
};

export const selectIsOfferingDocumentSubmitted = (state: IAppState): boolean | undefined => {
  const documents = selectIssuerEtoDocuments(state);

  if (documents) {
    return Object.keys(documents).some(
      key => documents[key].documentType === "approved_investor_offering_document",
    );
  }
  return undefined;
};

export const selectUploadedInvestmentAgreement = (
  state: DeepReadonly<IAppState>,
): IEtoDocument | null => {
  const etoDocuments = selectIssuerEtoDocuments(state)!;

  const key = Object.keys(etoDocuments).find(
    uploadedKey =>
      etoDocuments[uploadedKey].documentType ===
      EEtoDocumentType.INVESTMENT_AND_SHAREHOLDER_AGREEMENT,
  );
  return key ? etoDocuments[key] : null;
};

export const selectInvestmentAgreementLoading = (state: DeepReadonly<IAppState>): boolean =>
  state.etoFlow.signedInvestmentAgreementUrlLoading;

export const selectSignedInvestmentAgreementUrl = (state: DeepReadonly<IAppState>): string | null =>
  state.etoFlow.signedInvestmentAgreementUrl;

export const userHasKycAndEmailVerified = (state: IAppState) =>
  selectKycRequestStatus(state) === EKycRequestStatus.ACCEPTED &&
  selectIsUserEmailVerified(state.auth);

export const selectIsGeneralEtoLoading = (state: IAppState) =>
  selectIssuerEtoLoading(state) && selectEtoDocumentsLoading(state.etoDocuments);

export const selectNewPreEtoStartDate = (state: IAppState) => state.etoFlow.newStartDate;

export const selectPreEtoStartDateFromContract = (state: IAppState) => {
  const eto = selectIssuerEtoWithCompanyAndContract(state);

  if (eto && eto.contract) {
    return eto.contract.startOfStates[EETOStateOnChain.Whitelist];
  }

  return undefined;
};

export const selectPreEtoStartDate = (state: IAppState) =>
  selectNewPreEtoStartDate(state) || selectPreEtoStartDateFromContract(state);

export const selectCanChangePreEtoStartDate = (state: IAppState) => {
  const minDuration = selectIssuerEtoDateToWhitelistMinDuration(state);
  const date = selectPreEtoStartDateFromContract(state);
  return !date || isValidEtoStartDate(date, minDuration);
};

export const selectIsNewPreEtoStartDateValid = (state: IAppState) => {
  const minDuration = selectIssuerEtoDateToWhitelistMinDuration(state);
  const date = selectNewPreEtoStartDate(state);
  return date && isValidEtoStartDate(date, minDuration);
};

const recognizedProductTypes = [
  EProductName.HNWI_ETO_DE,
  EProductName.HNWI_ETO_LI,
  EProductName.MINI_ETO_LI,
  EProductName.RETAIL_ETO_DE,
  EProductName.RETAIL_ETO_LI_SECURITY,
  EProductName.RETAIL_ETO_LI_VMA,
  EProductName.FIFTH_FORCE_ETO,
];

export const selectAvailableProducts = createSelector(
  selectIssuerEtoFlow,
  ({ products }) => {
    if (products !== undefined) {
      const availableProducts = products
        .filter(product => product.available)
        // TODO: remove after platform-backend/#1550 is done
        .filter(product => product.name !== EProductName.FIFTH_FORCE_ETO)
        // Remove unrecognized product types
        .filter(product =>
          recognizedProductTypes.some(recognizedProd => recognizedProd === product.name),
        );

      return sortProducts(availableProducts);
    }

    return undefined;
  },
);

export const selectIsSaving = createSelector(
  selectIssuerEtoFlow,
  state => state.saving,
);

export const selectIsMarketingDataVisibleInPreview = createSelector(
  selectIssuerEto,
  state => state && state.isMarketingDataVisibleInPreview,
);
