// Templates to not be presented
export const ignoredTemplates: string[] = ["pamphletTemplate", "prospectusTemplate"];

export const ignoredTemplatesPublicView: string[] = [
  ...ignoredTemplates,
  "termsheetTemplate",
  "investmentMemorandumTemplate",
  "investmentSummaryTemplate",
];

// Templates to not be presented to nominee
export const nomineeIgnoredTemplates: string[] = [
  "pamphletTemplate",
  "prospectusTemplate",
  "investmentMemorandumTemplate",
  "investmentAndShareholderAgreementTemplate",
  "termsheetTemplate",
  "investmentSummaryTemplate",
];

// Termsheet template was enabled
// @see https://github.com/Neufund/platform-frontend/issues/2744
// Documents to not be publicly presented
export const ignoredDocuments: string[] = ["investment_and_shareholder_agreement"];
