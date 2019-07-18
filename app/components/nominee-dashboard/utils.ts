export interface IAccountSetupStepData {
  key: string,
  conditionCompleted: boolean,
  title: JSX.Element | string,
  component: JSX.Element | string
}

export interface IStepComponentProps {
  key: string;
  done: boolean;
  isActive: boolean;
  title: JSX.Element | string;
  component: JSX.Element | string;
}

export const prepareSetupAccountSteps = (data: IAccountSetupStepData[]): IStepComponentProps[] => {
  const newData = data.reduce((acc: { activeElement: string | null, data: IStepComponentProps[] }, stepData: IAccountSetupStepData) => {
      const isActive = !stepData.conditionCompleted && acc.activeElement === null;
      const stepComponentProps = {
        done: stepData.conditionCompleted,
        isActive: isActive,
        key: stepData.key,
        title: stepData.title,
        component: stepData.component,
      };
      acc.data.push(stepComponentProps);
      acc.activeElement = isActive ? stepData.key : acc.activeElement;
      return acc;
    },
    { activeElement: null, data: [] }
  );

  return newData.data
};
