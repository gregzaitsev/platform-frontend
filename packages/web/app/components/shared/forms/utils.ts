import * as Yup from "yup";
import {yupToFormErrors} from 'formik'

export type TConversionAndValidationSpec<Data> = {
  validator: Yup.Schema<unknown>,
  conversionFn: (data:Data) => unknown
}

export const validateForm = (validator:Yup.Schema<any>, data:any) => {
  try {
      validator.validateSync(data,{abortEarly:false, strict:true});
  } catch (e) {
    if (e instanceof Yup.ValidationError) {
      return yupToFormErrors(e);
    }
  }
  return undefined;
};

export const convertAndValidatePipeline = <Data extends {}>(validationSpec:TConversionAndValidationSpec<Data>[], data:Data) => {

  let res = undefined;
  for(let {conversionFn,validator} of validationSpec) {
    const converted = conversionFn(data);
    res = validateForm(validator, converted);
    if(res !== undefined){
      break;
    }
  }
  return res;
};
