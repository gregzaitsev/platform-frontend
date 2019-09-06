import * as cn from "classnames";
import * as React from "react";

import { COMPANY_TAGS_LIMIT } from "../../../config/constants";
import { EJurisdiction } from "../../../lib/api/eto/EtoProductsApi.interfaces";
import { TTranslatedString } from "../../../types";
import { Container, EColumnSpan, EContainerType } from "../../layouts/Container";
import { EImageFit, IResponsiveImage, ResponsiveImage } from "../../shared/ResponsiveImage";
import { Tag } from "../../shared/Tag";

import * as styles from "./Cover.module.scss";

interface IProps {
  companyBanner: IResponsiveImage;
  companyName: TTranslatedString;
  companyOneliner: TTranslatedString;
  companyLogo: IResponsiveImage;
  companyJurisdiction: EJurisdiction;
  tags: ReadonlyArray<TTranslatedString> | undefined;
}

export const Cover: React.FunctionComponent<IProps> = ({
  companyBanner,
  companyName,
  companyOneliner,
  companyLogo,
  tags = [],
}) => (
  <Container
    columnSpan={EColumnSpan.THREE_COL}
    className={styles.cover}
    type={EContainerType.CONTAINER}
  >
    <ResponsiveImage
      className={styles.banner}
      width={1250}
      height={400}
      srcSet={companyBanner.srcSet}
      alt={companyBanner.alt}
      fit={EImageFit.COVER}
    />

    <div className={styles.companyDetails}>
      <div className={styles.logoWrapper}>
        <img src={companyLogo.srcSet["1x"]} alt={companyLogo.alt} />
      </div>
      <div className={styles.details}>
        <h2 className={styles.name}>{companyName}</h2>
        <h3 className={styles.shortDescription}>{companyOneliner}</h3>
      </div>
      <div className={styles.tags}>
        {tags.slice(0, COMPANY_TAGS_LIMIT).map((tag, index) => (
          <Tag
            text={tag}
            className={cn(styles.tag, "ml-3")}
            layout="bold"
            theme="dark"
            key={index}
          />
        ))}
      </div>
    </div>
  </Container>
);
