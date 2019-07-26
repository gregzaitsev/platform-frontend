import * as React from "react";
import { FormattedMessage } from "react-intl-phraseapp";

import { TEtoWithCompanyAndContract } from "../../../modules/eto/types";
import { Container, EColumnSpan, EContainerType } from "../../layouts/Container";
import { Accordion, AccordionElement, AccordionField } from "../../shared/Accordion";
import { ChartDoughnut } from "../../shared/charts/ChartDoughnut.unsafe";
import { Panel } from "../../shared/Panel";
import { DashboardHeading } from "../shared/DashboardHeading";
import { CHART_COLORS } from "../shared/EtoView";

import * as styles from "./PublicView.module.scss";

const EtoAccordionElements: React.FunctionComponent<{ eto: TEtoWithCompanyAndContract }> = ({
  eto,
}) => {
  const {
    keyBenefitsForInvestors,
    targetMarketAndIndustry,
    roadmap,
    marketingApproach,
    useOfCapitalList,
    inspiration,
    companyMission,
    marketTraction,
    problemSolved,
    productVision,
    customerGroup,
    sellingProposition,
    keyCompetitors,
    businessModel,
    useOfCapital,
  } = eto.company;

  const shouldShowComponent =
    inspiration ||
    companyMission ||
    customerGroup ||
    productVision ||
    problemSolved ||
    marketTraction ||
    keyCompetitors ||
    sellingProposition ||
    useOfCapitalList ||
    marketingApproach ||
    roadmap ||
    targetMarketAndIndustry ||
    keyBenefitsForInvestors;

  return shouldShowComponent ? (
    <Container columnSpan={EColumnSpan.TWO_COL} type={EContainerType.INHERIT_GRID}>
      <Container columnSpan={EColumnSpan.TWO_COL}>
        <>
          <DashboardHeading
            title={<FormattedMessage id="eto.public-view.product-vision.title" />}
          />
          <Panel>
            <Accordion openFirst={true}>
              <AccordionField
                title={<FormattedMessage id="eto.form.product-vision.inspiration" />}
                value={inspiration}
              />
              <AccordionField
                title={<FormattedMessage id="eto.form.product-vision.company-mission" />}
                value={companyMission}
              />
              <AccordionField
                title={<FormattedMessage id="eto.form.product-vision.product-vision" />}
                value={productVision}
              />
              <AccordionField
                title={<FormattedMessage id="eto.form.product-vision.problem-solved" />}
                value={problemSolved}
              />
              <AccordionField
                title={<FormattedMessage id="eto.form.product-vision.customer-group" />}
                value={customerGroup}
              />
              <AccordionField
                title={<FormattedMessage id="eto.form.product-vision.problem-solved" />}
                value={problemSolved}
              />
              <AccordionField
                title={<FormattedMessage id="eto.form.product-vision.target-segment" />}
                value={targetMarketAndIndustry}
              />
              <AccordionField
                title={<FormattedMessage id="eto.form.product-vision.key-competitors" />}
                value={keyCompetitors}
              />
              <AccordionField
                title={<FormattedMessage id="eto.form.product-vision.selling-proposition" />}
                value={sellingProposition}
              />
              <AccordionField
                title={<FormattedMessage id="eto.form.product-vision.key-benefits-for-investors" />}
                value={keyBenefitsForInvestors}
              />
              {(useOfCapitalList && useOfCapitalList.some(e => e && e.percent && e.percent > 0)) ||
              useOfCapital ? (
                <AccordionElement
                  title={<FormattedMessage id="eto.form.product-vision.use-of-capital" />}
                >
                  {useOfCapital && <p>{useOfCapital}</p>}

                  {useOfCapitalList && (
                    <ChartDoughnut
                      className={styles.doughnut}
                      layout="vertical"
                      data={{
                        datasets: [
                          {
                            data: useOfCapitalList.map(d => d && d.percent) as number[],
                            backgroundColor: useOfCapitalList.map(
                              (_, i: number) => CHART_COLORS[i],
                            ),
                          },
                        ],
                        labels: (useOfCapitalList || []).map(d => d && d.description) as string[],
                      }}
                    />
                  )}
                </AccordionElement>
              ) : null}
              <AccordionField
                title={<FormattedMessage id="eto.form.product-vision.market-traction" />}
                value={marketTraction}
              />
              <AccordionField
                title={<FormattedMessage id="eto.form.product-vision.roadmap" />}
                value={roadmap}
              />
              <AccordionField
                title={<FormattedMessage id="eto.form.product-vision.business-model" />}
                value={businessModel}
              />
              <AccordionField
                title={<FormattedMessage id="eto.form.product-vision.marketing-approach" />}
                value={marketingApproach}
              />
            </Accordion>
          </Panel>
        </>
      </Container>
    </Container>
  ) : null;
};

export { EtoAccordionElements };
