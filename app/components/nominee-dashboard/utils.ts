import { EMaskedFormError } from "../translatedMessages/messages";

export interface IAccountSetupStepData {
  key: string;
  conditionCompleted: boolean;
  title: JSX.Element | string;
  component: JSX.Element | string;
}

export interface IStepComponentProps {
  key: string;
  stepState: EAccountSetupStepState;
  title: JSX.Element | string;
  component: JSX.Element | string;
  number: number;
  isLast: boolean;
}

export enum EAccountSetupStepState {
  DONE = "done",
  ACTIVE = "active",
  NOT_DONE = "notDone",
}

const determineStepState = (isActive: boolean, completed: boolean): EAccountSetupStepState => {
  if (isActive) {
    return EAccountSetupStepState.ACTIVE;
  } else if (completed) {
    return EAccountSetupStepState.DONE;
  } else {
    return EAccountSetupStepState.NOT_DONE;
  }
};

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
        isLast: index + 1 === data.length,
      };
      acc.data.push(stepComponentProps);
      acc.activeElement = isActive ? stepData.key : acc.activeElement;
      return acc;
    },
    { activeElement: null, data: [] },
  );

  return newData.data;
};

export const validateEthInput = (value:string | undefined) => {
  if(value === undefined){
    return undefined
  } else if (value.length > 0 || value.length < 42) {
    return value.split("").reduce((acc:EMaskedFormError | undefined, char: string, i:number) => {
      if(i === 0 && char !== "0"){
        return EMaskedFormError.IVALID_PREFIX
      } else if (i === 1 && char !== "x") {
        return EMaskedFormError.IVALID_PREFIX
      } else if (i >= 2 && !RegExp(/[a-fA-F\d]/).test(char)) {
        return EMaskedFormError.ILLEGAL_CHARACTER
      } else if (i > 41) {
        return EMaskedFormError.MAX_LENGTH_EXCEEDED
      } else {
        return acc
      }
    }, undefined)
  } else {
    return validateEthAddress(value) ? undefined : EMaskedFormError.GENERIC_ERROR
  }
};

export const validateEthAddress = (value:string | undefined) => {
  if(value === undefined) {
    return false
  } else {
    return RegExp(/0x[\da-fA-F]{40}/).test(value)
  }
};
