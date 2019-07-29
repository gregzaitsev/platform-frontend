import * as React from "react";

import { TTranslatedString } from "../../types";
import { Field } from "./Field";
import { InlineIcon } from "./icons";

import * as indicatorIcon from "../../assets/img/inline_icons/accordion_arrow.svg";
import * as styles from "./Accordion.module.scss";

interface IAccordionElementProps {
  title: TTranslatedString;
  isOpened?: boolean;
}

interface IAccordionElementState {
  isOpened: boolean;
}

type IAccordionChildren =
  | React.ReactElement<IAccordionElementProps | null>
  | React.ReactElement<IAccordionElementProps | null>[]
  | null;

interface IAccordionProps {
  openFirst?: boolean;
  children?: IAccordionChildren | IAccordionChildren[];
}

class AccordionElement extends React.Component<IAccordionElementProps, IAccordionElementState> {
  state = {
    isOpened: this.props.isOpened || false,
  };

  toggleClose = () => {
    this.setState(s => ({ isOpened: !s.isOpened }));
  };

  render(): React.ReactChild {
    const { title, children } = this.props;
    const { isOpened } = this.state;

    return (
      <div className={`${styles.accordionElement} ${isOpened ? "" : "is-closed"}`}>
        <h4 className={styles.title} onClick={this.toggleClose}>
          <span>{title}</span>
          <InlineIcon width="16px" height="16px" svgIcon={indicatorIcon} />
        </h4>
        <div className={styles.content}>{children}</div>
      </div>
    );
  }
}

const Accordion: React.FunctionComponent<IAccordionProps> = ({ children, openFirst }) => (
  <div className={styles.accordion}>
    {React.Children.toArray(children)
      // filter all empty children
      .filter((child: React.ReactNode) => child)
      .map((child: React.ReactNode, index: number) =>
        openFirst && index === 0
          ? // clone element and add isOpened to it if it's first one
            React.cloneElement<IAccordionElementProps>(
              // type cast is required due of toArray that changes elements to ReactChild
              child as React.ReactElement<IAccordionElementProps>,
              { isOpened: true },
            )
          : child,
      )}
  </div>
);

const AccordionField: React.FunctionComponent<{
  title: TTranslatedString;
  value: string | undefined;
}> = ({ title, value }) => (
  <>
    {value ? (
      <AccordionElement title={title}>
        <Field name="inspiration" value={value} />
      </AccordionElement>
    ) : null}
  </>
);

export { Accordion, AccordionElement, AccordionField };
