import { EMaskedFormError } from "../../translatedMessages/messages";

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
      acc: { activeElement: string | undefined; data: IStepComponentProps[] },
      stepData: IAccountSetupStepData,
      index: number,
    ) => {
      const isActive = !stepData.conditionCompleted && acc.activeElement === undefined;

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
    { activeElement: undefined, data: [] },
  );

  return newData.data;
};

export const validateEthInput = (value: string | undefined) => {
  if (value === undefined) {
    return undefined;
  } else {
    console.log("=====validateEthInput", value)

    let error = undefined;
    for(let [i,char] of value.split("").entries()) {
      if (i === 0 && char !== "0") {
        error =  EMaskedFormError.IVALID_PREFIX;
        break;
      } else if (i === 1 && char !== "x") {
        error =  EMaskedFormError.IVALID_PREFIX;
        break;
      } else if (i >= 2 && !RegExp(/[a-fA-F\d]/).test(char)) {
        error =  EMaskedFormError.ILLEGAL_CHARACTER;
        break;
      } else if (i > 41) {
        error =  EMaskedFormError.MAX_LENGTH_EXCEEDED;
        break;
      } else {
        error = undefined;
      }
    }
    return error
  }
};

export const validateEthAddress = (value: string | undefined) => {
  if (value === undefined) {
    return false;
  } else {
    return RegExp(/^0x[\da-fA-F]{40}$/).test(value);
  }
};
