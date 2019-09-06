import * as React from "react";

type IExternalProps = {
  children: number;
};

const Percentage: React.FunctionComponent<IExternalProps> = ({ children }) => (
  <>{`${children * 100}%`}</>
);

export { Percentage };
