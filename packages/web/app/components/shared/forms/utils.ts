import * as Yup from "yup";
import { yupToFormErrors } from 'formik'
import { Schema } from "yup";

export type TConversionAndValidationSpec<Data> = {
  validator: Yup.Schema<unknown>,
  conversionFn: (data: Data) => unknown
}

export const validateForm = (validator: Yup.Schema<any>, data: any) => {
  try {
    validator.validateSync(data, { abortEarly: false, strict: true });
  } catch (e) {
    if (e instanceof Yup.ValidationError) {
      return yupToFormErrors(e);
    }
  }
  return undefined;
};

export const convertAndValidatePipeline = <Data extends {}>(validationSpec: TConversionAndValidationSpec<Data>[], data: Data) => {
  /* we run all validations and collect their results in an array, */
  /* then create and return a single errors object. Flattening of errors goes from  */
  /* right to left (reduceRight) because the earlier validations have precedence over the later ones  */
  let validationResults = [];
  for (let { conversionFn, validator } of validationSpec) {
    const converted = conversionFn(data);
    const currentValidationResult = validateForm(validator, converted);
    if (currentValidationResult !== undefined) {
      validationResults.push(currentValidationResult);
    }
  }

  return validationResults.reduceRight((acc: object | undefined, result)=> {
    if(acc !== undefined){
      return {
        ...acc,
        ...result
      }
    } else {
      return result
    }
  }, undefined);
};

type TTransformationSpec<T> = { [key:string]: (validatorFields: { [field in keyof T]: Schema<any> },key: string) => { [field in keyof T]: Schema<any> } }

export type ObjectSchema<T> = Yup.ObjectSchema<T> & {
  fields: { [field in keyof T]: Schema<T[field]> }
}

export const replaceValidatorWith = (newValidator: Yup.Schema<unknown>) => <T>(validatorFields: { [field in keyof T]: Schema<T[field]> }, key: keyof T) => {
  (validatorFields[key] as any) = newValidator;
  return validatorFields
};

export const deleteValidator = () => <T>(validatorFields: { [field in keyof T]: Schema<T[field]> }, key: keyof T) => {
  delete validatorFields[key];
  return validatorFields
};

export const addValidator = (newValidator: Yup.Schema<unknown>) => (validatorFields: { [field:string]:Schema<unknown> }, key: string) => {
  validatorFields[key] = newValidator;
  return validatorFields
};

export const transformValidator = <T>(transformationSpec: TTransformationSpec<T>) => (baseValidator: Yup.ObjectSchema<T>) => {
  //fixme check input
  const validatorCopy = baseValidator.clone();

  Object.keys(transformationSpec).forEach(key => {
    (validatorCopy as ObjectSchema<unknown>).fields = transformationSpec[key]((validatorCopy as ObjectSchema<T>).fields, key)
  });

  return validatorCopy as Yup.ObjectSchema<unknown>
};
