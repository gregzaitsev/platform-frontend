import * as React from "react";

interface IHiResImageProps {
  partialPath: string;
  className?: string;
  alt?: string;
  title?: string;
  max2x?: boolean;
}

export const HiResImage: React.FunctionComponent<IHiResImageProps> = ({
  partialPath,
  className,
  alt,
  title,
  max2x,
}) => {
  if (process.env.NODE_ENV === "test") {
    return <div />;
  }

  try {
    const image = require("../../assets/img/" + partialPath + ".png");
    const image2x = require("../../assets/img/" + partialPath + "@2x.png");

    let srcSet: string;
    if (max2x) {
      srcSet = `${image} 1x, ${image2x} 2x`;
    } else {
      const image3x = require("../../assets/img/" + partialPath + "@3x.png");

      srcSet = `${image} 1x, ${image2x} 2x, ${image3x} 3x`;
    }

    return <img src={image} srcSet={srcSet} className={className} alt={alt} title={title} />;
  } catch (e) {
    // we show error here. Otherwise react goes into loop
    // tslint:disable-next-line
    console.error(
      `Couldnt find image at path assets/img/${partialPath}.png" or one of sub-resolutions`,
    );
    return <div />;
  }
};
