import * as cn from "classnames";
import { map } from "lodash/fp";
import * as React from "react";
import { FormattedRelative } from "react-intl";
import { FormattedMessage } from "react-intl-phraseapp";
import { Link } from "react-router-dom";
import { Col, Row } from "reactstrap";

import { externalRoutes } from "../../config/externalRoutes";
import { IEtoDocument, immutableDocumentName } from "../../lib/api/eto/EtoFileApi.interfaces";
import { TETOWithInvestorTicket } from "../../modules/investor-tickets/types";
import { getNeuReward } from "../../modules/investor-tickets/utils";
import { EETOStateOnChain } from "../../modules/public-etos/types";
import { withParams } from "../../utils/withParams";
import { getDocumentTitles } from "../documents/utils";
import { AssetPortfolio } from "../shared/AssetPortfolio";
import { Button, EButtonLayout } from "../shared/buttons";
import { ETOState } from "../shared/ETOState";
import { ECurrency, ECurrencySymbol, EMoneyFormat, Money } from "../shared/Money";
import { NewTable, NewTableRow } from "../shared/NewTable";
import { SectionHeader } from "../shared/SectionHeader";
import { ClaimedDividends } from "../wallet/claimed-dividends/ClaimedDividends";
import { PortfolioAssetAction } from "./PorfolioAssetAction";

import * as neuIcon from "../../assets/img/neu_icon.svg";
import { ImmutableFileId } from "../../lib/api/ImmutableStorage.interfaces";
import { ButtonTextPosition } from "../shared/buttons/Button";
import * as styles from "./PortfolioLayout.module.scss";

export type TPortfolioLayoutProps = {
  myAssets: TETOWithInvestorTicket[];
  pendingAssets: TETOWithInvestorTicket[];
  myNeuBalance: string;
  myNeuBalanceEuroAmount: string;
  neuPrice: string;
  walletAddress: string;
  isRetailEto: boolean;
  downloadDocument: (immutableFileId: ImmutableFileId, fileName: string) => void;
};

const transactions: any[] = []; // TODO: Connect source of data

const PortfolioLayout: React.SFC<TPortfolioLayoutProps> = ({
  myAssets,
  pendingAssets,
  myNeuBalance,
  myNeuBalanceEuroAmount,
  neuPrice,
  walletAddress,
  isRetailEto,
  downloadDocument,
}) => (
  <section className={styles.portfolio}>
    {process.env.NF_ASSETS_PORTFOLIO_COMPONENT_VISIBLE === "1" && (
      <>
        <SectionHeader layoutHasDecorator={false} className="mb-4">
          <FormattedMessage id="portfolio.section.asset-portfolio.title" />
        </SectionHeader>

        <Row>
          <Col className="mb-4">
            <AssetPortfolio
              icon={neuIcon}
              currency={ECurrency.NEU}
              currencyTotal={ECurrency.EUR}
              largeNumber="1000000000000"
              value="10000000000000"
              theme="light"
              size="large"
              moneyValue="100000000"
              moneyChange={-20}
              tokenValue="1000000"
              tokenChange={20}
            />
          </Col>
        </Row>
      </>
    )}

    <SectionHeader layoutHasDecorator={false} className="mb-4">
      <FormattedMessage id="portfolio.section.my-proceeds.title" />
    </SectionHeader>

    <Row>
      <Col className="mb-4">
        <ClaimedDividends className="h-100" totalEurValue="0" recentPayouts={transactions} />
      </Col>
    </Row>

    <SectionHeader
      layoutHasDecorator={false}
      className="mb-4"
      description={<FormattedMessage id="portfolio.section.reserved-assets.description" />}
    >
      <FormattedMessage id="portfolio.section.reserved-assets.title" />
    </SectionHeader>

    <Row>
      <Col className="mb-4">
        <NewTable
          keepRhythm={true}
          placeholder={
            <FormattedMessage id="portfolio.section.reserved-assets.table.header.placeholder" />
          }
          titles={[
            <FormattedMessage id="portfolio.section.reserved-assets.table.header.token" />,
            <FormattedMessage id="portfolio.section.reserved-assets.table.header.balance" />,
            <FormattedMessage id="portfolio.section.reserved-assets.table.header.value-eur" />,
            <FormattedMessage id="portfolio.section.reserved-assets.table.header.price-eur" />,
            <>
              <img src={neuIcon} alt="neu token" className={cn("mr-2", styles.tokenSmall)} />
              <FormattedMessage id="portfolio.section.reserved-assets.table.header.neu-reward" />
            </>,
            <FormattedMessage id="portfolio.section.reserved-assets.table.header.eto-status" />,
          ]}
        >
          {pendingAssets.map(
            ({
              equityTokenImage,
              equityTokenName,
              investorTicket,
              contract,
              etoId,
              previewCode,
            }) => {
              const timedState = contract!.timedState;
              const isWhitelistedOrPublic =
                timedState === EETOStateOnChain.Whitelist || timedState === EETOStateOnChain.Public;

              return (
                <NewTableRow key={etoId}>
                  <>
                    <img src={equityTokenImage} alt="" className={cn("mr-2", styles.token)} />
                    <span>{equityTokenName}</span>
                  </>
                  <>{investorTicket.equityTokenInt.toString()}</>
                  <Money
                    value={investorTicket.equivEurUlps.toString()}
                    currency={ECurrency.EUR}
                    currencySymbol={ECurrencySymbol.NONE}
                  />
                  <>{getNeuReward(investorTicket.equityTokenInt, investorTicket.equivEurUlps)}</>
                  <Money
                    value={investorTicket.rewardNmkUlps.toString()}
                    currency={ECurrency.NEU}
                    currencySymbol={ECurrencySymbol.NONE}
                  />
                  <>
                    {isWhitelistedOrPublic ? (
                      <>
                        Ends{" "}
                        <FormattedRelative
                          value={contract!.startOfStates[EETOStateOnChain.Signing]!}
                        />
                      </>
                    ) : (
                      <ETOState previewCode={previewCode} />
                    )}
                  </>
                  <PortfolioAssetAction state={timedState} etoId={etoId} />
                </NewTableRow>
              );
            },
          )}
        </NewTable>
      </Col>
    </Row>

    <SectionHeader
      layoutHasDecorator={false}
      className="mb-4"
      description={<FormattedMessage id="portfolio.section.your-assets.description" />}
    >
      <FormattedMessage id="portfolio.section.your-assets.title" />
    </SectionHeader>

    <Row>
      <Col className="mb-4">
        <NewTable
          keepRhythm={true}
          placeholder={<FormattedMessage id="portfolio.section.your-assets.table.placeholder" />}
          titles={[
            <FormattedMessage id="portfolio.section.reserved-assets.table.header.token" />,
            <FormattedMessage id="portfolio.section.reserved-assets.table.header.balance" />,
            <FormattedMessage id="portfolio.section.reserved-assets.table.header.value-eur" />,
            <FormattedMessage id="portfolio.section.reserved-assets.table.header.price-eur" />,
            <>
              <img src={neuIcon} alt="neu token" className={cn("mr-2", styles.tokenSmall)} />
              <FormattedMessage id="portfolio.section.reserved-assets.table.header.neu-reward" />
            </>,
            <FormattedMessage id="portfolio.section.reserved-assets.table.header.documents" />,
          ]}
        >
          {myNeuBalance !== "0" ? (
            <NewTableRow>
              <>
                <img src={neuIcon} alt="" className={cn("mr-2", styles.token)} />
                <span>{"NEU"}</span>
              </>
              <Money
                value={myNeuBalance}
                currency={ECurrency.NEU}
                currencySymbol={ECurrencySymbol.NONE}
              />
              <Money
                value={myNeuBalanceEuroAmount}
                currency={ECurrency.EUR}
                currencySymbol={ECurrencySymbol.NONE}
              />
              <Money
                value={neuPrice}
                format={EMoneyFormat.FLOAT}
                currency={ECurrency.EUR}
                currencySymbol={ECurrencySymbol.NONE}
              />
              <>{"-"}</>
              <Link
                to={withParams(externalRoutes.commitmentStatus, { walletAddress })}
                target={"_blank"}
              >
                <FormattedMessage id="portfolio.section.your-assets.tokenholder-agreement" />
              </Link>
            </NewTableRow>
          ) : null}

          {myAssets.map(
            ({ equityTokenImage, equityTokenName, investorTicket, etoId, documents }) => {
              return (
                <NewTableRow key={etoId}>
                  <>
                    <img src={equityTokenImage} alt="" className={cn("mr-2", styles.token)} />
                    <span>{equityTokenName}</span>
                  </>
                  <>{investorTicket.equityTokenInt.toString()}</>
                  <Money
                    value={investorTicket.equivEurUlps.toString()}
                    currency={ECurrency.EUR}
                    currencySymbol={ECurrencySymbol.NONE}
                  />
                  <>{getNeuReward(investorTicket.equityTokenInt, investorTicket.equivEurUlps)}</>
                  <Money
                    value={investorTicket.rewardNmkUlps.toString()}
                    currency={ECurrency.NEU}
                    currencySymbol={ECurrencySymbol.NONE}
                  />
                  <>
                    {map((document: IEtoDocument) => {
                      return (
                        <Button
                          key={document.ipfsHash}
                          className={styles.documentLink}
                          layout={EButtonLayout.INLINE}
                          textPosition={ButtonTextPosition.LEFT}
                          onClick={() =>
                            downloadDocument(
                              {
                                ipfsHash: document.ipfsHash,
                                mimeType: document.mimeType,
                                asPdf: true,
                              },
                              immutableDocumentName[document.documentType],
                            )
                          }
                        >
                          {getDocumentTitles(isRetailEto)[document.documentType]}
                        </Button>
                      );
                    }, documents)}
                  </>
                </NewTableRow>
              );
            },
          )}
        </NewTable>
      </Col>
    </Row>
  </section>
);

export { PortfolioLayout };
