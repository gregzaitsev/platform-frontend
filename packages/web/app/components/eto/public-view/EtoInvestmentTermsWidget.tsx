import * as React from "react";
import { FormattedMessage } from "react-intl-phraseapp";
import { compose } from "recompose";

import { ETHEREUM_ZERO_ADDRESS } from "../../../config/constants";
import { EEtoDocumentType, IEtoDocument } from "../../../lib/api/eto/EtoFileApi.interfaces";
import { EAssetType, EJurisdiction } from "../../../lib/api/eto/EtoProductsApi.interfaces";
import { actions } from "../../../modules/actions";
import { TEtoWithCompanyAndContract } from "../../../modules/eto/types";
import { appConnect } from "../../../store";
import { TDataTestId, TTranslatedString } from "../../../types";
import { DocumentTemplateButton } from "../../shared/DocumentLink";
import { FormatNumber } from "../../shared/formatters/FormatNumber";
import { FormatNumberRange } from "../../shared/formatters/FormatNumberRange";
import { MoneyNew } from "../../shared/formatters/Money";
import { MoneyRange } from "../../shared/formatters/MoneyRange";
import {
  ECurrency,
  ENumberInputFormat,
  ENumberOutputFormat,
  EPriceFormat,
  ESpecialNumber,
  selectUnits,
} from "../../shared/formatters/utils";
import { Panel } from "../../shared/Panel";
import { Percentage } from "../../shared/Percentage";
import { InvestmentAmount } from "../shared/InvestmentAmount";
import { ToBeAnnounced, ToBeAnnouncedTooltip } from "../shared/ToBeAnnouncedTooltip";

import * as styles from "./EtoInvestmentTermsWidget.module.scss";

type TExternalProps = {
  etoData: TEtoWithCompanyAndContract;
};

type TDispatchProps = {
  downloadDocument: (document: IEtoDocument) => void;
};

type TEntryExternalProps = {
  label: TTranslatedString;
  value: React.ReactNode;
};

interface IDownloadIsha {
  etoData: TEtoWithCompanyAndContract;
  downloadDocument: (document: IEtoDocument) => void;
}

const Entry: React.FunctionComponent<TEntryExternalProps & TDataTestId> = ({
  label,
  value,
  "data-test-id": dataTestId,
}) => (
  <div className={styles.entry}>
    <span className={styles.label}>{label}</span>
    <span className={styles.value} data-test-id={dataTestId}>
      {value}
    </span>
  </div>
);

const DownloadIshaOrTermsheetLink: React.FunctionComponent<IDownloadIsha> = ({
  etoData,
  downloadDocument,
}) => {
  const getKeyByType = (documentType: EEtoDocumentType) =>
    Object.keys(etoData.documents).find(
      (key: string) => etoData.documents[key].documentType === documentType,
    );

  let docKey = getKeyByType(EEtoDocumentType.SIGNED_INVESTMENT_AND_SHAREHOLDER_AGREEMENT);
  if (docKey) {
    return (
      <DocumentTemplateButton
        title={<FormattedMessage id="eto.documents.signed-investment-and-shareholder-agreement" />}
        onClick={() => downloadDocument(etoData.documents[docKey!])}
      />
    );
  }
  docKey = getKeyByType(EEtoDocumentType.INVESTMENT_AND_SHAREHOLDER_AGREEMENT_PREVIEW);
  if (docKey) {
    return (
      <DocumentTemplateButton
        title={<FormattedMessage id="eto.documents.investment-and-shareholder-agreement-preview" />}
        onClick={() => downloadDocument(etoData.documents[docKey!])}
      />
    );
  }
  docKey = getKeyByType(EEtoDocumentType.INVESTMENT_AND_SHAREHOLDER_AGREEMENT_PREVIEW);
  if (docKey) {
    return (
      <DocumentTemplateButton
        title={<FormattedMessage id="eto.documents.signed-termsheet" />}
        onClick={() => downloadDocument(etoData.documents[docKey!])}
      />
    );
  }
  return null;
};

const EtoInvestmentTermsWidgetLayout: React.FunctionComponent<TExternalProps & TDispatchProps> = ({
  etoData,
  downloadDocument,
}) => {
  const isProductSet = etoData.product.id !== ETHEREUM_ZERO_ADDRESS;
  const computedNewSharePrice = etoData.preMoneyValuationEur / etoData.existingCompanyShares;

  return (
    <Panel className={styles.tokenTerms}>
      <div className={styles.content} data-test-id="eto-public-view-token-terms">
        <div className={styles.group}>
          <div className={styles.groupTitle}>
            <FormattedMessage id="eto.public-view.token-terms.group-title.equity" />
          </div>
          <div className={styles.groupContent}>
            <Entry
              label={<FormattedMessage id="eto.public-view.token-terms.pre-money-valuation" />}
              value={
                <MoneyNew
                  value={etoData.preMoneyValuationEur}
                  inputFormat={ENumberInputFormat.FLOAT}
                  valueType={ECurrency.EUR}
                  outputFormat={ENumberOutputFormat.INTEGER}
                  defaultValue={<ToBeAnnouncedTooltip />}
                />
              }
              data-test-id="eto-public-view-pre-money-valuation"
            />
            <Entry
              label={<FormattedMessage id="eto.public-view.token-terms.existing-shares" />}
              value={
                <FormatNumber
                  value={etoData.existingCompanyShares}
                  outputFormat={ENumberOutputFormat.INTEGER}
                  inputFormat={ENumberInputFormat.FLOAT}
                  defaultValue={<ToBeAnnounced />}
                />
              }
              data-test-id="eto-public-view-existing-shares"
            />
            {etoData.authorizedCapitalShares && (
              <Entry
                label={<FormattedMessage id="eto.public-view.token-terms.authorized-capital" />}
                value={
                  <FormatNumber
                    value={etoData.authorizedCapitalShares}
                    outputFormat={ENumberOutputFormat.INTEGER}
                    inputFormat={ENumberInputFormat.FLOAT}
                    defaultValue={<ToBeAnnounced />}
                  />
                }
                data-test-id="eto-public-view-authorized-capital"
              />
            )}
            <Entry
              label={<FormattedMessage id="eto.public-view.token-terms.new-shares-to-issue" />}
              value={
                <FormatNumberRange
                  valueFrom={etoData.minimumNewSharesToIssue}
                  valueUpto={etoData.newSharesToIssue}
                  outputFormat={ENumberOutputFormat.INTEGER}
                  inputFormat={ENumberInputFormat.FLOAT}
                  defaultValue={<ToBeAnnounced />}
                />
              }
              data-test-id="eto-public-view-new-shares-to-issue"
            />
            {!!etoData.newSharesToIssueInWhitelist && (
              <Entry
                label={
                  <FormattedMessage id="eto.public-view.token-terms.new-shares-to-issue-in-whitelist" />
                }
                value={
                  <FormatNumber
                    value={etoData.newSharesToIssueInWhitelist}
                    outputFormat={ENumberOutputFormat.INTEGER}
                    inputFormat={ENumberInputFormat.FLOAT}
                    defaultValue={<ToBeAnnounced />}
                  />
                }
                data-test-id="eto-public-view-new-shares-to-issue-in-whitelist"
              />
            )}
            <Entry
              label={<FormattedMessage id="eto.public-view.token-terms.new-share-price" />}
              value={
                <MoneyNew
                  value={computedNewSharePrice}
                  valueType={EPriceFormat.SHARE_PRICE}
                  inputFormat={ENumberInputFormat.FLOAT}
                  outputFormat={ENumberOutputFormat.FULL}
                  defaultValue={<ToBeAnnounced />}
                />
              }
              data-test-id="eto-public-view-new-share-price"
            />
            <Entry
              label={<FormattedMessage id="eto.public-view.token-terms.investment-amount" />}
              value={<InvestmentAmount etoData={etoData} />}
              data-test-id="eto-public-view-investment-amount"
            />
            <DownloadIshaOrTermsheetLink etoData={etoData} downloadDocument={downloadDocument} />
          </div>
        </div>

        <div className={styles.divider} />

        <div className={styles.group}>
          <div className={styles.groupTitle}>
            <FormattedMessage id="eto.public-view.token-terms.group-title.token-sale" />
          </div>
          <div className={styles.groupContent}>
            <Entry
              label={<FormattedMessage id="eto.public-view.token-terms.tokens-per-share" />}
              value={
                <FormatNumber
                  value={etoData.equityTokensPerShare}
                  outputFormat={ENumberOutputFormat.INTEGER}
                  inputFormat={ENumberInputFormat.FLOAT}
                  defaultValue={<ToBeAnnounced />}
                />
              }
              data-test-id="eto-public-view-tokens-per-share"
            />
            <Entry
              label={<FormattedMessage id="eto.public-view.token-terms.token-price" />}
              value={
                <MoneyNew
                  value={
                    computedNewSharePrice && etoData.equityTokensPerShare
                      ? computedNewSharePrice / etoData.equityTokensPerShare
                      : undefined
                  }
                  inputFormat={ENumberInputFormat.FLOAT}
                  valueType={EPriceFormat.EQUITY_TOKEN_PRICE_EURO}
                  outputFormat={ENumberOutputFormat.FULL}
                  defaultValue={<ToBeAnnounced />}
                />
              }
              data-test-id="eto-public-view-token-price"
            />
            {!!etoData.whitelistDiscountFraction && (
              <Entry
                label={<FormattedMessage id="eto.public-view.token-terms.whitelist-discount" />}
                value={<Percentage>{etoData.whitelistDiscountFraction}</Percentage>}
                data-test-id="eto-public-view-whitelist-discount"
              />
            )}
            {!!etoData.publicDiscountFraction && (
              <Entry
                label={<FormattedMessage id="eto.public-view.token-terms.public-discount" />}
                value={<Percentage>{etoData.publicDiscountFraction}</Percentage>}
                data-test-id="eto-public-view-public-discount"
              />
            )}
            <Entry
              label={<FormattedMessage id="eto.public-view.token-terms.ticket-size" />}
              value={
                <MoneyRange
                  valueFrom={etoData.minTicketEur}
                  valueUpto={etoData.maxTicketEur ? etoData.maxTicketEur : ESpecialNumber.UNLIMITED}
                  inputFormat={ENumberInputFormat.FLOAT}
                  valueType={ECurrency.EUR}
                  outputFormat={ENumberOutputFormat.INTEGER}
                  defaultValue={<ToBeAnnounced />}
                />
              }
              data-test-id="eto-public-view-ticket-size"
            />
            <Entry
              label={<FormattedMessage id="eto.public-view.token-terms.currencies.label" />}
              value={
                etoData.currencies ? (
                  etoData.currencies.map(selectUnits).join(", ")
                ) : (
                  <ToBeAnnounced />
                )
              }
              data-test-id="eto-public-view-currencies"
            />
            <Entry
              label={<FormattedMessage id="eto.public-view.token-terms.pre-eto-duration" />}
              value={
                etoData.whitelistDurationDays ? (
                  <FormattedMessage
                    id="eto.public-view.token-terms.days"
                    values={{ days: etoData.whitelistDurationDays }}
                  />
                ) : (
                  <ToBeAnnounced />
                )
              }
              data-test-id="eto-public-view-pre-eto-duration"
            />
            <Entry
              label={<FormattedMessage id="eto.public-view.token-terms.public-eto-duration" />}
              value={
                etoData.publicDurationDays ? (
                  <FormattedMessage
                    id="eto.public-view.token-terms.days"
                    values={{ days: etoData.publicDurationDays }}
                  />
                ) : (
                  <ToBeAnnounced />
                )
              }
              data-test-id="eto-public-view-public-eto-duration"
            />
            <Entry
              label={
                <FormattedMessage id="eto.public-view.token-terms.public-eto.product.jurisdiction" />
              }
              value={
                isProductSet ? (
                  <>
                    {etoData.product.jurisdiction === EJurisdiction.GERMANY && (
                      <FormattedMessage
                        id={`eto.public-view.token-terms.public-eto.product.jurisdiction.de`}
                      />
                    )}
                    {etoData.product.jurisdiction === EJurisdiction.LIECHTENSTEIN && (
                      <FormattedMessage
                        id={`eto.public-view.token-terms.public-eto.product.jurisdiction.li`}
                      />
                    )}
                  </>
                ) : (
                  <ToBeAnnounced />
                )
              }
              data-test-id="eto-public-view-public-eto-duration"
            />
            {etoData.templates && etoData.templates.reservationAndAcquisitionAgreement && (
              <DocumentTemplateButton
                title={
                  <FormattedMessage id="eto.documents.reservation-and-acquisition-agreement" />
                }
                onClick={() =>
                  downloadDocument(etoData.templates.reservationAndAcquisitionAgreement)
                }
              />
            )}
          </div>
        </div>

        <div className={styles.divider} />

        <div className={styles.group}>
          <div className={styles.groupTitle}>
            <FormattedMessage id="eto.public-view.token-terms.group-title.token-holder-rights" />
          </div>
          <div className={styles.groupContent}>
            <Entry
              label={<FormattedMessage id="eto.public-view.token-terms.nominee" />}
              value={etoData.nominee ? etoData.nomineeDisplayName : <ToBeAnnounced />}
              data-test-id="eto-public-view-nominee"
            />
            <Entry
              label={<FormattedMessage id="eto.public-view.token-terms.public-offer-duration" />}
              value={
                etoData.signingDurationDays ? (
                  <FormattedMessage
                    id="eto.public-view.token-terms.days"
                    values={{ days: etoData.signingDurationDays }}
                  />
                ) : (
                  <ToBeAnnounced />
                )
              }
              data-test-id="eto-public-view-public-offer-duration"
            />

            <Entry
              label={<FormattedMessage id="eto.public-view.token-transferability" />}
              value={
                etoData.enableTransferOnSuccess === undefined ? (
                  <ToBeAnnounced />
                ) : etoData.enableTransferOnSuccess === true ? (
                  <FormattedMessage id="eto.public-view.token-transferability.yes" />
                ) : (
                  <FormattedMessage id="eto.public-view.token-transferability.no" />
                )
              }
              data-test-id="eto-public-view-token-transferability"
            />

            {etoData.enableTransferOnSuccess && (
              <Entry
                label={<FormattedMessage id="eto.public-view.token-terms.token-tradability" />}
                value={
                  <>
                    {etoData.tokenTradeableOnSuccess ? (
                      <FormattedMessage id="eto.public-view.token-terms.enabled" />
                    ) : (
                      <FormattedMessage id="eto.public-view.token-terms.disabled" />
                    )}
                  </>
                }
                data-test-id="eto-public-view-token-tradability"
              />
            )}

            <Entry
              label={<FormattedMessage id="eto.public-view.asset-type" />}
              value={
                isProductSet ? (
                  etoData.product.assetType === EAssetType.SECURITY ? (
                    <FormattedMessage id={`eto.public-view.asset-type.security`} />
                  ) : (
                    <FormattedMessage id={`eto.public-view.asset-type.vma`} />
                  )
                ) : (
                  <ToBeAnnounced />
                )
              }
              data-test-id="eto-public-view-asset-type"
            />

            <Entry
              label={<FormattedMessage id="eto.public-view.token-terms.voting-rights" />}
              value={
                etoData.generalVotingRule === undefined ? (
                  <ToBeAnnounced />
                ) : etoData.generalVotingRule === "negative" ? (
                  <FormattedMessage id="eto.public-view.token-terms.no" />
                ) : (
                  <FormattedMessage id="eto.public-view.token-terms.yes" />
                )
              }
              data-test-id="eto-public-view-voting-rights"
            />

            <Entry
              label={<FormattedMessage id="eto.public-view.dividend-rights" />}
              value={
                etoData.hasDividendRights ? (
                  <FormattedMessage id="form.select.yes" />
                ) : (
                  <ToBeAnnounced />
                )
              }
              data-test-id="eto-public-view-dividend-rights"
            />

            {etoData.templates && etoData.templates.companyTokenHolderAgreement && (
              <DocumentTemplateButton
                title={<FormattedMessage id="eto.documents.tokenholder-agreement" />}
                onClick={() => downloadDocument(etoData.templates.companyTokenHolderAgreement)}
              />
            )}
          </div>
        </div>
      </div>
    </Panel>
  );
};

const EtoInvestmentTermsWidget = compose<TExternalProps & TDispatchProps, TExternalProps>(
  appConnect<{}, TDispatchProps, TExternalProps>({
    dispatchToProps: dispatch => ({
      downloadDocument: (document: IEtoDocument) =>
        dispatch(actions.eto.downloadEtoDocument(document)),
    }),
  }),
)(EtoInvestmentTermsWidgetLayout);

export { EtoInvestmentTermsWidget, EtoInvestmentTermsWidgetLayout };
