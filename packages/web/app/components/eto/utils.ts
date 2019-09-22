import { cloneDeep, flow, get, set } from "lodash";

import { invariant } from "../../utils/invariant";
import { formatFlexiPrecision } from "../../utils/Number.utils";

export interface ICompoundField {
  [x: string]: string | number | undefined;
}

//TODO remove it. Data should come from backend with all defaults set
export const applyDefaults = (data: any, defaults: any) => {
  const dataCopy = { ...data };

  return Object.keys(defaults).reduce((acc, key) => {
    if (acc[key] === undefined || acc[key] === null) {
      acc[key] = defaults[key];
    }
    return acc;
  }, dataCopy);
};

/**** DATA CONVERSION FUNCTIONS ****/
export const convert = (conversionSpec: any) => (data: any) => {
  if (data) {
    const dataCopy = cloneDeep(data);
    Object.keys(conversionSpec).forEach(key => {
      const fieldValue = get(dataCopy, key);
      set(dataCopy, key, convertField(fieldValue, conversionSpec[key]));
    });
    return dataCopy;
  } else {
    return data;
  }
};

const convertField = (input: any, f: any) => {
  if (Array.isArray(f)) {
    return flow(f)(input);
  } else {
    return input !== undefined ? f(input) : input;
  }
};

export const convertInArray = (conversionSpec: any) => (data: any[]) => {
  if (Array.isArray(data)) {
    return data.map(element => convert(conversionSpec)(element));
  } else {
    return data;
  }
};

const findNonEmptyKeyValueField = (data: ICompoundField | undefined) => {
  if (data) {
    const keys = Object.keys(data);

    return data[keys[0]] !== undefined || data[keys[1]] !== undefined;
  }

  return undefined;
};

//removes data left from empty key-value fields, e.g. {key:undefined,value:undefined}
export const removeEmptyKeyValueFields = () => (data: ICompoundField[] | undefined) => {
  if (data !== undefined && data !== null) {
    const cleanData = data.filter(field => findNonEmptyKeyValueField(field));
    return cleanData.length ? cleanData : undefined;
  } else {
    return undefined;
  }
};

export const setEmptyKeyValueFieldsUndefined = () => (data: ICompoundField[] | undefined) => {
  if (data !== undefined && data !== null) {
    const cleanData = data.map(field => (findNonEmptyKeyValueField(field) ? field : undefined));
    return cleanData.length ? cleanData : undefined;
  } else {
    return undefined;
  }
};

//removes empty key-value fields, e.g. {key:undefined,value:undefined}
export const removeEmptyKeyValueField = () => (data: ICompoundField | undefined) =>
  findNonEmptyKeyValueField(data) ? data : undefined;

type TConvertPercentageToFractionOptions = { passThroughInvalidData: true };
// add an option to pass invalid values on. This is to be used in validation pipelines
export const convertPercentageToFraction = (options?: TConvertPercentageToFractionOptions) => (
  data: number | undefined,
) => {
  const parseFn = (data: number) => parseFloat((data / 100).toPrecision(4));

  if (options && options.passThroughInvalidData) {
    return typeof data === "number" && Number.isFinite(data) ? parseFn(data) : data;
  } else {
    invariant(
      data === undefined || Number.isFinite(data),
      "convertPercentageToFraction: cannot convert non-number",
    );
    return data !== undefined ? parseFn(data) : data;
  }
};

export const convertFractionToPercentage = () => (data: number | undefined) => {
  invariant(
    data === undefined || Number.isFinite(data),
    "convertFractionToPercentage: cannot convert NaN",
  );
  return data !== undefined ? parseFloat((data * 100).toFixed(2)) : data;
};

type TParseStringToFloatData = string | number | undefined;

type TParseStringToFloatOptions = { passThroughInvalidData: true };

// add an option to pass invalid values on. This is to be used in validation pipelines
export function parseStringToFloat(): (data: TParseStringToFloatData) => number | undefined;
export function parseStringToFloat(
  options: TParseStringToFloatOptions,
): (data: TParseStringToFloatData) => string | number | undefined;
/* tslint:disable */
export function parseStringToFloat(options?: TParseStringToFloatOptions) {
  return (data: TParseStringToFloatData): number | undefined | string => {
    const result = typeof data === "string" ? parseFloat(data) : data;
    if (Number.isFinite(result!)) {
      return result;
    } else {
      return options && options.passThroughInvalidData ? data : undefined;
    }
  };
}
/* tslint:enable */

export const parseStringToInteger = () => (data: string | number | undefined) => {
  if (typeof data === "string") {
    const result = parseInt(data, 10);
    return Number.isNaN(result) ? undefined : result;
  } else {
    return data;
  }
};

export const convertNumberToString = () => (data: number | undefined) => {
  invariant(
    data === undefined || Number.isFinite(data),
    "convertNumberToString: cannot convert NaN",
  );
  return data !== undefined ? data.toString() : data;
};

export const convertToPrecision = (precision: number) => (data: number) => {
  if (data && !Number.isNaN(data)) {
    return parseFloat(formatFlexiPrecision(data, precision));
  } else {
    return undefined;
  }
};

export const setDefaultValueIfUndefined = (defaultValue: any) => (data: any) =>
  data === undefined ? defaultValue : data;

export const removeEmptyField = () => (data: any) => {
  if (
    data === "" ||
    (Array.isArray(data) && data.length === 0) ||
    data === null ||
    Number.isNaN(data)
  ) {
    data = undefined;
  }
  return data;
};

export const removeField = () => () => undefined;

// this is to generate unique keys
// that we supply to react elements when mapping over an array of data
export const generateKeys = () => (data: { key: string }[]) =>
  data &&
  data.map(arrayElement => {
    arrayElement.key = Math.random().toString();
    return arrayElement;
  });

// removes unique keys created with generateKeys()
// if API doesn't accept them
export const removeKeys = () => (data: { key: string }[]) =>
  data &&
  data.map(arrayElement => {
    delete arrayElement.key;
    return arrayElement;
  });
