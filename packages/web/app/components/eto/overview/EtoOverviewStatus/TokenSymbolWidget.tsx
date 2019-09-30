import * as React from "react";

import { EImageFit, IResponsiveImage, ResponsiveImage } from "../../../shared/ResponsiveImage";

import * as styles from "./TokenSymbolWidget.module.scss";

export interface ITokenSymbolWidgetProps {
  tokenImage: IResponsiveImage;
  brandName?: string;
  tokenName?: string;
  tokenSymbol?: string;
}

const TokenSymbolWidget: React.FunctionComponent<ITokenSymbolWidgetProps> = ({
  tokenSymbol,
  tokenName,
  tokenImage,
}) => (
  <div className={styles.tokenSymbolWidget}>
    <div className={styles.tokenImageWrapper}>
      <ResponsiveImage {...tokenImage} className={styles.tokenImage} fit={EImageFit.COVER} />
    </div>
    <div>
      <h3 className={styles.tokenName}>
        {tokenName}
        {tokenSymbol && ` (${tokenSymbol})`}
      </h3>
    </div>
  </div>
);

export { TokenSymbolWidget };
