import * as cn from "classnames";
import { some } from "lodash";
import * as React from "react";
import { FormattedMessage } from "react-intl-phraseapp";
import { compose } from "recompose";

import { ETHEREUM_ZERO_ADDRESS } from "../../../config/constants";
import {
  EtoCompanyInformationType,
  EtoPitchType,
  TSocialChannelsType,
} from "../../../lib/api/eto/EtoApi.interfaces.unsafe";
import { TEtoWithCompanyAndContract } from "../../../modules/eto/types";
import { withMetaTags } from "../../../utils/withMetaTags.unsafe";
import { Container, EColumnSpan, EContainerType } from "../../layouts/Container";
import { WidgetGrid } from "../../layouts/WidgetGrid";
import { PersonProfileModal } from "../../modals/PersonProfileModal";
import { FieldSchemaProvider } from "../../shared/Field";
import { ILink, MediaLinksWidget } from "../../shared/MediaLinksWidget";
import { Panel } from "../../shared/Panel";
import { Slides } from "../../shared/Slides";
import { IEtoSocialProfile, SocialProfilesList } from "../../shared/SocialProfilesList";
import { TwitterTimelineEmbed } from "../../shared/TwitterTimeline";
import { Video } from "../../shared/Video";
import { EtoOverviewStatus } from "../overview/EtoOverviewStatus/EtoOverviewStatus";
import { CompanyDescription } from "../public-view/CompanyDescription";
import { Cover } from "../public-view/Cover";
import { CoverBanner } from "../public-view/CoverBanner";
import { DocumentsWidget } from "../public-view/DocumentsWidget";
import { EtoAccordionElements } from "../public-view/EtoAccordionElements";
import { EtoInvestmentTermsWidget } from "../public-view/EtoInvestmentTermsWidget";
import { ETOTimeline } from "../public-view/ETOTimeline";
import { Individuals } from "../public-view/Individuals";
import { LegalInformationWidget } from "../public-view/LegalInformationWidget";
import { MarketingDocumentsWidget } from "../public-view/MarketingDocumentsWidget";
import { DashboardHeading } from "./DashboardHeading";

import * as styles from "./EtoView.module.scss";

export const CHART_COLORS = ["#50e3c2", "#2fb194", "#4a90e2", "#0b0e11", "#394652", "#c4c5c6"];
export const DEFAULT_CHART_COLOR = "#c4c5c6";

interface IProps {
  eto: TEtoWithCompanyAndContract;
  publicView: boolean;
}

// TODO: There are lots of castings right now in this file, cause formerly the types of IProps was "any"
// The castings should be resolved when the EtoApi.interface.ts reflects the correct data types from swagger!

const EtoViewSchema = EtoCompanyInformationType.toYup().concat(EtoPitchType.toYup());

// TODO: Refactor to smaller components
const EtoViewLayout: React.FunctionComponent<IProps> = ({ eto, publicView }) => {
  const {
    socialChannels,
    companyVideo,
    categories,
    disableTwitterFeed,
    companySlideshare,
    brandName,
    companyOneliner,
    companyLogo,
    companyBanner,
    companyNews,
    marketingLinks,
  } = eto.company;

  const isTwitterFeedEnabled =
    some<TSocialChannelsType[0]>(
      socialChannels,
      channel => channel.type === "twitter" && !!channel.url && !!channel.url.length,
    ) && !disableTwitterFeed;
  const isYouTubeVideoAvailable = !!(companyVideo && companyVideo.url);
  const isSlideShareAvailable = !!(companySlideshare && companySlideshare.url);
  const hasSocialChannelsAdded = !!(socialChannels && socialChannels.length);
  const twitterUrl =
    isTwitterFeedEnabled && socialChannels
      ? socialChannels.find(c => c.type === "twitter") &&
        socialChannels.find(c => c.type === "twitter")!.url
      : "";

  const isProductSet = eto.product.id !== ETHEREUM_ZERO_ADDRESS;

  const shouldSplitGrid =
    isSlideShareAvailable ||
    isTwitterFeedEnabled ||
    isYouTubeVideoAvailable ||
    hasSocialChannelsAdded
      ? EColumnSpan.TWO_COL
      : EColumnSpan.THREE_COL;

  return (
    <FieldSchemaProvider value={EtoViewSchema}>
      <PersonProfileModal />
      <WidgetGrid className={styles.etoLayout} data-test-id="eto.public-view">
        <CoverBanner eto={eto} publicView={publicView} />
        <Cover
          companyName={brandName}
          companyOneliner={companyOneliner}
          companyJurisdiction={eto.product.jurisdiction}
          companyLogo={{
            alt: brandName,
            srcSet: {
              "1x": companyLogo as string,
            },
          }}
          companyBanner={{
            alt: brandName,
            srcSet: {
              "1x": companyBanner as string,
            },
          }}
          tags={categories}
        />
        <EtoOverviewStatus eto={eto} publicView={publicView} isEmbedded={false} />
        <ETOTimeline eto={eto} />

        <Container columnSpan={shouldSplitGrid}>
          <CompanyDescription eto={eto} />
          <LegalInformationWidget companyData={eto.company} columnSpan={EColumnSpan.THREE_COL} />
        </Container>
        <Container columnSpan={EColumnSpan.ONE_COL}>
          {isSlideShareAvailable && (
            <Container>
              <DashboardHeading title={<FormattedMessage id="eto.public-view.pitch-deck" />} />
              <Slides slideShareUrl={companySlideshare && companySlideshare.url} />
            </Container>
          )}

          {isYouTubeVideoAvailable && (
            <Container>
              <DashboardHeading title={<FormattedMessage id="eto.public-view.youtube" />} />
              <Video youTubeUrl={companyVideo && companyVideo.url} hasModal />
            </Container>
          )}
          <Container>
            <div className={cn((isSlideShareAvailable || isYouTubeVideoAvailable) && "mt-4")}>
              <SocialProfilesList profiles={(socialChannels as IEtoSocialProfile[]) || []} />
            </div>
          </Container>
        </Container>
        <MarketingDocumentsWidget
          columnSpan={EColumnSpan.THREE_COL}
          companyMarketingLinks={marketingLinks}
        />
        {isProductSet && (
          <Container columnSpan={EColumnSpan.THREE_COL}>
            <DashboardHeading title={<FormattedMessage id="eto.public-view.token-terms.title" />} />
            <EtoInvestmentTermsWidget etoData={eto} />
          </Container>
        )}
        <Individuals eto={eto} />
        <EtoAccordionElements eto={eto} />

        <Container columnSpan={EColumnSpan.ONE_COL} type={EContainerType.INHERIT_GRID}>
          <DocumentsWidget
            columnSpan={EColumnSpan.THREE_COL}
            companyMarketingLinks={marketingLinks}
            etoTemplates={eto.templates}
            etoDocuments={eto.documents}
            offeringDocumentType={eto.product.offeringDocumentType}
          />

          {isTwitterFeedEnabled && (
            <Container columnSpan={EColumnSpan.ONE_COL}>
              <DashboardHeading title={<FormattedMessage id={"eto.public-view.twitter-feed"} />} />
              <Panel className={styles.twitter}>
                <TwitterTimelineEmbed url={twitterUrl!} userName={brandName} />
              </Panel>
            </Container>
          )}

          {companyNews && !!companyNews[0].url && (
            <Container columnSpan={EColumnSpan.ONE_COL}>
              <DashboardHeading title={<FormattedMessage id="eto.form.media-links.title" />} />
              <MediaLinksWidget
                links={[...companyNews].reverse() as ILink[]}
                columnSpan={EColumnSpan.THREE_COL}
              />
            </Container>
          )}
        </Container>
      </WidgetGrid>
    </FieldSchemaProvider>
  );
};

const EtoView = compose<IProps, IProps>(
  withMetaTags<IProps>(({ eto }, intl) => {
    const requiredDataPresent =
      eto.company.brandName && eto.equityTokenName && eto.equityTokenSymbol;

    return {
      title: requiredDataPresent
        ? `${eto.company.brandName} - ${eto.equityTokenName} (${eto.equityTokenSymbol})`
        : intl.formatIntlMessage("menu.eto-page"),
    };
  }),
)(EtoViewLayout);

export { EtoView, EtoViewLayout };
