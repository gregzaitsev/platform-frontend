import { expect } from "chai";
import * as Yup from "yup";

import { convertAndValidatePipeline } from "./utils";


describe("convertAndValidatePipeline", () => {
  it("it converts the data and runs validations step by step according to conversion/validation spec", async () => {
    const data = {value:"25.7"};

    const spec = [
      {
        validator: Yup.object().shape({value:Yup.number()}),
        conversionFn: (x:{value:string}) => ({value:parseFloat(x.value)})
      },
      {
        validator: Yup.object().shape({value:Yup.string()}),
        conversionFn: (x:{value:string}) => ({value:`252525${x}`})
      }
    ];

    expect(convertAndValidatePipeline(spec, data)).to.eq(undefined); /* e.g. no errors */
  });

  it.only("it returns errors for the first invalid spec as formik errors object", () => {
    const data = {
      value2:"yyy",
      value3:"xxx",
    };
    const validator = Yup.object().shape({
      value2: Yup.number().typeError("this is not a number!"),
      value3: Yup.number().typeError("this is not a number!"),
    });

    const spec = [
      {/* this spec generates errors, validator should stop here */
        validator,
        conversionFn: (x:{value3:string, value2:string}) => ({
          value2:parseFloat(x.value2),
          value3:parseFloat(x.value3),
        })
      },
      {/* this converts data to a valid form but validator will stop earlier */
        validator,
        conversionFn: (_:{value3:string, value2:string}) => ({
          value2:2,
          value3:3,
        })
      },
      {/* this is not valid either but the validator stops earlier */
        validator,
        conversionFn: (x:{value3:string, value2:string}) => ({
          value2:`252525${x.value2}`,
          value3:`252525${x.value3}`,
        })
      }
    ];
    expect(convertAndValidatePipeline(spec, data)).to.deep.eq({
      value2: 'this is not a number!',
      value3: 'this is not a number!'
    });
  });

  it.only("it returns next errors if the previous specs haven't any", () => {
    const data = {
      value2:"25",
      value3:"27",
    };
    const validator0 = Yup.object().shape({
      value2: Yup.number().typeError("this is not a number!"),
      value3: Yup.number().typeError("this is not a number!"),
    });

    const validator3 = Yup.object().shape({
      value2: Yup.string().min(15, "this string is too short!"),
      value3: Yup.string().min(25, "this string is too short!"),
    });
    const spec = [
      {/* data is valid for this spec */
        validator:validator0,
        conversionFn: (x:{value3:string, value2:string}) => ({
          value2:parseFloat(x.value2),
          value3:parseFloat(x.value3),
        })
      },
      {/* this converts data to a valid form */
        validator:validator0,
        conversionFn: (_:{value3:string, value2:string}) => ({
          value2:2,
          value3:3,
        })
      },
      {/* this spec converts data to into an invalid shape */
        validator:validator3,
        conversionFn: (x:{value3:string, value2:string}) => ({
          value2:`252525${x.value2}`,
          value3:`252525${x.value3}`,
        })
      }
    ];
    expect(convertAndValidatePipeline(spec, data)).to.deep.eq({
      value2: 'this string is too short!',
      value3: 'this string is too short!'
    });
  })
});
