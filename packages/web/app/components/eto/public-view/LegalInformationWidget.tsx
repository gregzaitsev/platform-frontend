import * as React from "react";
import { FormattedMessage } from "react-intl-phraseapp";

import {
  TCompanyEtoData,
  TEtoLegalShareholderType,
} from "../../../lib/api/eto/EtoApi.interfaces.unsafe";
import { Container, EColumnSpan } from "../../layouts/Container";
import { ChartDoughnut } from "../../shared/charts/ChartDoughnut.unsafe";
import { generateColor } from "../../shared/charts/utils";
import { FormatNumber } from "../../shared/formatters/FormatNumber";
import { MoneyNew } from "../../shared/formatters/Money";
import { ECurrency, ENumberInputFormat, ENumberOutputFormat } from "../../shared/formatters/utils";
import { Panel } from "../../shared/Panel";
import { FUNDING_ROUNDS } from "../constants";
import { DashboardHeading } from "../shared/DashboardHeading";
import { CHART_COLORS } from "../shared/EtoView";

import * as styles from "./LegalInformationWidget.module.scss";

interface IProps {
  companyData: TCompanyEtoData;
  columnSpan?: EColumnSpan;
}

const generateShareholders = (
  shareholders: TCompanyEtoData["shareholders"],
  companyShares: number,
): ReadonlyArray<TEtoLegalShareholderType> => {
  if (shareholders === undefined) {
    return [];
  } else {
    const assignedShares = shareholders.reduce(
      (acc, shareholder) => (shareholder && shareholder.shares ? (acc += shareholder.shares) : acc),
      0,
    );

    // Filter out any possible empty elements for type safety
    // This is temporary fix
    // TODO: rewrite types to get rid of optional
    // https://github.com/Neufund/platform-frontend/issues/3054
    const shrholders = shareholders.filter((v): v is TEtoLegalShareholderType => !!v);

    if (assignedShares < companyShares) {
      return [
        ...shrholders,
        {
          fullName: "Others",
          shares: companyShares - assignedShares,
        },
      ];
    }
    return shrholders;
  }
};

export const LegalInformationWidget: React.FunctionComponent<IProps> = ({
  companyData,
  columnSpan,
}) => {
  const shareholdersData = generateShareholders(
    companyData.shareholders,
    companyData.companyShares,
  );

  return (
    <Container columnSpan={EColumnSpan.TWO_COL}>
      <DashboardHeading title={<FormattedMessage id="eto.public-view.legal-information.title" />} />
      <Panel className={styles.legalInformation} columnSpan={columnSpan}>
        <div className={styles.group}>
          {companyData.name && (
            <div className={styles.entry}>
              <span className={styles.label}>
                <FormattedMessage id="eto.public-view.legal-information.legal-company-name" />
              </span>
              <span className={styles.value}>{companyData.name}</span>
            </div>
          )}
          {companyData.name && (
            <div className={styles.entry}>
              <span className={styles.label}>
                <FormattedMessage id="eto.public-view.legal-information.legal-form" />
              </span>
              <span className={styles.value}>{companyData.legalForm}</span>
            </div>
          )}
          {companyData.foundingDate && (
            <div className={styles.entry}>
              <span className={styles.label}>
                <FormattedMessage id="eto.public-view.legal-information.incorporation-date" />
              </span>
              <span className={styles.value}>{companyData.foundingDate}</span>
            </div>
          )}
          {companyData.registrationNumber && (
            <div className={styles.entry}>
              <span className={styles.label}>
                <FormattedMessage id="eto.public-view.legal-information.registration-number" />
              </span>
              <span className={styles.value}>{companyData.registrationNumber}</span>
            </div>
          )}
          {companyData.numberOfFounders && (
            <div className={styles.entry}>
              <span className={styles.label}>
                <FormattedMessage id="eto.public-view.legal-information.number-of-founders" />
              </span>
              <span className={styles.value}>
                <FormatNumber
                  value={companyData.numberOfFounders}
                  outputFormat={ENumberOutputFormat.INTEGER}
                  inputFormat={ENumberInputFormat.FLOAT}
                />
              </span>
            </div>
          )}
          {companyData.numberOfEmployees && (
            <div className={styles.entry}>
              <span className={styles.label}>
                <FormattedMessage id="eto.public-view.legal-information.number-of-employees" />
              </span>
              <span className={styles.value}>{companyData.numberOfEmployees}</span>
            </div>
          )}
          {companyData.companyStage && (
            <div className={styles.entry}>
              <span className={styles.label}>
                <FormattedMessage id="eto.public-view.legal-information.last-funding-round" />
              </span>
              <span className={styles.value}>{FUNDING_ROUNDS[companyData.companyStage]}</span>
            </div>
          )}
          {companyData.lastFundingSizeEur && (
            <div className={styles.entry}>
              <span className={styles.label}>
                <FormattedMessage id="eto.public-view.legal-information.last-funding-amount" />
              </span>
              <span className={styles.value}>
                <MoneyNew
                  value={companyData.lastFundingSizeEur}
                  inputFormat={ENumberInputFormat.FLOAT}
                  valueType={ECurrency.EUR}
                  outputFormat={ENumberOutputFormat.INTEGER}
                />
              </span>
            </div>
          )}
          {companyData.companyShares && (
            <div className={styles.entry}>
              <span className={styles.label}>
                <FormattedMessage id="eto.public-view.legal-information.existing-shares" />
              </span>
              <span className={styles.value}>
                <FormatNumber
                  value={companyData.companyShares}
                  outputFormat={ENumberOutputFormat.INTEGER}
                  inputFormat={ENumberInputFormat.FLOAT}
                />
              </span>
            </div>
          )}
        </div>

        {companyData.shareholders && companyData.shareholders.length > 0 && (
          <ChartDoughnut
            data={{
              datasets: [
                {
                  data: shareholdersData.map(d => d && d.shares),
                  backgroundColor: shareholdersData.map(
                    (shareholder: TEtoLegalShareholderType, i: number) =>
                      // Use predefined colors first, then use generated colors
                      CHART_COLORS[i] || generateColor(`${i}${shareholder.fullName}`),
                  ),
                },
              ],
              labels: shareholdersData.map(d => d && d.fullName),
            }}
          />
        )}
      </Panel>
    </Container>
  );
};
