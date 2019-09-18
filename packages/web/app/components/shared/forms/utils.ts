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

  let res = undefined;
  for (let { conversionFn, validator } of validationSpec) {
    const converted = conversionFn(data);
    res = validateForm(validator, converted);
    if (res !== undefined) {
      break;
    }
  }
  return res;
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
