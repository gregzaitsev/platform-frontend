import * as cn from "classnames";
import * as React from "react";

import { TTranslatedString } from "../../types";
import { ISrcSet, ResponsiveImage } from "./ResponsiveImage";

import * as styles from "./SlidePerson.module.scss";

export type TSlidePersonLayout = "horizontal" | "vertical";
interface IProps {
  srcSet: ISrcSet;
  name: string;
  description: TTranslatedString;
  role?: TTranslatedString;
  layout?: TSlidePersonLayout;
}

export const SlidePerson: React.SFC<IProps> = ({ srcSet, name, role, description, layout }) => {
  return (
    <div className={cn(styles.slidePerson, layout)}>
      <div className={styles.image}>
        <ResponsiveImage srcSet={srcSet} alt={name} />
      </div>
      <div>
        <h5 className={styles.name}>{name}</h5>
        {role && <h6 className={styles.title}>{role}</h6>}
        <p className={styles.bio}>{description}</p>
      </div>
    </div>
  );
};

SlidePerson.defaultProps = {
  layout: "horizontal",
};