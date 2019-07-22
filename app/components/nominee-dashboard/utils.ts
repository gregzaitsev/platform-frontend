export interface IAccountSetupStepData {
  key: string;
  conditionCompleted: boolean;
  title: JSX.Element | string;
  component: JSX.Element | string;
}

export interface IStepComponentProps {
  key: string;
  stepState: EAccountSetupStepState
  title: JSX.Element | string;
  component: JSX.Element | string;
  number: number
}

export enum EAccountSetupStepState {
  DONE = "done",
  ACTIVE = "active",
  NOT_DONE = "notDone"
}

const determineStepState = (isActive:boolean, completed:boolean):EAccountSetupStepState => {
  if(isActive) {
    return EAccountSetupStepState.ACTIVE
  } else if (completed) {
    return EAccountSetupStepState.DONE
  } else {
    return EAccountSetupStepState.NOT_DONE
  }
}

export const prepareSetupAccountSteps = (data: IAccountSetupStepData[]): IStepComponentProps[] => {
  const newData = data.reduce(
    (
      acc: { activeElement: string | null; data: IStepComponentProps[] },
      stepData: IAccountSetupStepData,
      index: number,
    ) => {
      const isActive = !stepData.conditionCompleted && acc.activeElement === null;

      const stepComponentProps = {
        stepState: determineStepState(isActive, stepData.conditionCompleted),
        number: index + 1,
        key: stepData.key,
        title: stepData.title,
        component: stepData.component,
      };
      acc.data.push(stepComponentProps);
      acc.activeElement = isActive ? stepData.key : acc.activeElement;
      return acc;
    },
    { activeElement: null, data: [] },
  );

  return newData.data;
};
