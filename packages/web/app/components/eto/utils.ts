import { cloneDeep, flow, get, set } from "lodash";

import {
  TCompanyEtoData,
} from "../../lib/api/eto/EtoApi.interfaces.unsafe";
import { invariant } from "../../utils/invariant";
import { formatFlexiPrecision } from "../../utils/Number.utils";
import { TShareholder } from "./public-view/LegalInformationWidget";

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

export const convert = (data: any, conversionSpec: any) => {
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
    return data.map(element => convert(element, conversionSpec));
  } else {
    return data;
  }
};

const findNonEmptyKeyValueField = (data: ICompoundField | undefined) => {
  if (data) {
    const keys = Object.keys(data);

    return data[keys[0]] !== undefined && data[keys[1]] !== undefined;
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

//removes empty key-value fields, e.g. {key:undefined,value:undefined}
export const removeEmptyKeyValueField = () => (data: ICompoundField | undefined) =>
  findNonEmptyKeyValueField(data) ? data : undefined;

export const convertPercentageToFraction = () => (data: number | undefined) => {
  invariant(
    data === undefined || Number.isFinite(data),
    "convertPercentageToFraction: cannot convert NaN",
  );

  return data !== undefined ? parseFloat((data / 100).toPrecision(4)) : data;
};

export const convertFractionToPercentage = () => (data: number | undefined) => {
  invariant(
    data === undefined || Number.isFinite(data),
    "convertFractionToPercentage: cannot convert NaN",
  );
  return data !== undefined ? parseFloat((data * 100).toFixed(2)) : data;
};

export const parseStringToFloat = () => (data: string | number | undefined) => {
  const result = typeof data === "string" ? parseFloat(data) : data;
  return !Number.isFinite(result!) ? undefined : result; //need to assert here to be able to test `undefined` too
};

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

type TEtoLegalShareholderTypeNarrowed = {
  fullName: string,
  shareCapital: number,
}

type TChartDataGeneratorInternal = {
  totalPercentage: number,
  shareholders: TShareholder[]
}

const shareholderSortingFunction = (a:TShareholder,b:TShareholder) => {
  if(a.percentageOfShares === b.percentageOfShares) {
    return 0
  }else {
    return a.percentageOfShares < b.percentageOfShares ? 1 : -1
  }
};

export const generateShareholders = (
  shareholders: TCompanyEtoData["shareholders"],
  companyShares: number,
): ReadonlyArray<TShareholder> => {
  if (shareholders === undefined) {
    return [];
  } else {
    const shareholdersData = shareholders.filter(
      (shareholder): shareholder is TEtoLegalShareholderTypeNarrowed =>
        !!(shareholder && shareholder.fullName && shareholder.shareCapital),
    );

    const assignedShares = shareholdersData.reduce(
      (acc, shareholder) => (acc += shareholder.shareCapital),
      0,
    );

    if (assignedShares < companyShares) {
      shareholdersData.push({
        fullName: "Others",
        shareCapital: companyShares - assignedShares,
      },)
    }

    const chartData = shareholdersData.reduce(
      (acc: TChartDataGeneratorInternal, shareholder: TEtoLegalShareholderTypeNarrowed, index: number) => {
        if (acc.totalPercentage < 100) {
          const shareCapitalPercentage = Math.round((shareholder.shareCapital * 100) / companyShares);
          const totalPercentage = acc.totalPercentage + shareCapitalPercentage;

          // the last member of array that makes totalPercentage <= 100
          // gets the rest of (100% - shares) to account for the rounding errors,
          // all the following members are not included in the result
          const shareCapitalPercentageCorrected = (index !== shareholdersData.length - 1 && totalPercentage <= 100)
            ? shareCapitalPercentage
            : 100 - acc.totalPercentage;

          if (shareCapitalPercentageCorrected > 0) {
            acc.shareholders.push({
              fullName: shareholder.fullName,
              percentageOfShares: shareCapitalPercentageCorrected,
            });
          }

          acc.totalPercentage = totalPercentage
        }
        return acc
      }, { totalPercentage: 0, shareholders: [] });

    return chartData.shareholders.sort(shareholderSortingFunction);
  }
};
