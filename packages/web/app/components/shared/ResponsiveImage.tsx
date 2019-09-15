import * as cn from "classnames";
import * as React from "react";

import { Proportion } from "./Proportion";

import * as styles from "./ResponsiveImage.module.scss";

export interface ISrcSet {
  "1x": string;
  "2x"?: string;
  "3x"?: string;
}

type TTheme = "light" | "dark" | "transparent";

export enum EImageFit {
  COVER = styles.fitCover,
  CONTAIN = styles.fitContain,
}

interface IResponsiveImage {
  src?: string;
  srcSet: ISrcSet;
  alt: string;
  theme?: TTheme;
  width?: number;
  height?: number;
  className?: string;
  onClick?: () => void;
  fit?: EImageFit;
}

const srcSetToString = (srcSet: ISrcSet) =>
  `${srcSet["1x"]} 1x,
    ${srcSet["2x"] && srcSet["2x"] + " 2x"},
    ${srcSet["3x"] && srcSet["3x"] + " 3x"}`;

const ResponsiveImage: React.FunctionComponent<IResponsiveImage> = ({
  alt,
  className,
  src,
  srcSet,
  height,
  width,
  theme,
  onClick,
  fit,
}) => (
  <Proportion
    width={width}
    height={height}
    className={cn(styles.responsiveImage, className, theme)}
    onClick={onClick}
  >
    {srcSet["1x"] && (
      <img
        className={cn(styles.image, fit)}
        src={src || srcSet["1x"]}
        srcSet={srcSetToString(srcSet)}
        alt={alt}
      />
    )}
  </Proportion>
);

ResponsiveImage.defaultProps = {
  theme: "dark",
  fit: EImageFit.CONTAIN,
};

export { ResponsiveImage, IResponsiveImage, srcSetToString };
