import { expect } from "chai";

import { TShareholder } from "./public-view/LegalInformationWidget";
import {
  applyDefaults,
  convert,
  convertFractionToPercentage,
  convertInArray,
  convertNumberToString,
  convertPercentageToFraction,
  convertToPrecision,
  generateShareholders,
  parseStringToFloat,
  removeEmptyField,
  removeEmptyKeyValueField,
  removeEmptyKeyValueFields,
} from "./utils";

describe("removeEmptyKeyValueField", () => {
  it("removes empty key-value fields", () => {
    const badInput = { a: undefined };
    const goodInput = { a: 1, b: 2 };
    expect(removeEmptyKeyValueField()(badInput)).to.be.undefined;
    expect(removeEmptyKeyValueField()(goodInput)).to.deep.equal(goodInput);
  });
});

describe("removeEmptyKeyValueFields", () => {
  it("iterates over an array of key-value objects and filters out all empty ones", () => {
    const input = [{ a: 1, b: 2 }, { a: undefined }];
    const expected = [{ a: 1, b: 2 }];
    expect(removeEmptyKeyValueFields()(input)).to.deep.equal(expected);
  });
  it("returns undefined if resulting array is empty", () => {
    const input = [{ a: undefined, b: undefined }, { a: undefined }];
    expect(removeEmptyKeyValueFields()(input)).to.be.undefined;
  });
});

describe("applyDefaults", () => {
  it("sets defaults if value is missing/undefined", () => {
    const data = { key1: "value", key2: 222, key3: null, key4: undefined };
    const defaults = {
      key2: "defaultValue 2",
      key3: "defaultValue 3",
      key4: "defaultValue 4",
      key5: "defaultValue 5",
    };
    const output = {
      key1: "value",
      key2: 222,
      key3: "defaultValue 3",
      key4: "defaultValue 4",
      key5: "defaultValue 5",
    };
    expect(applyDefaults(data, defaults)).to.deep.equal(output);
  });
});

describe("convert", () => {
  const bla2fufu = (input: any) => (input === "bla" ? "fufu" : input);
  const fufu2pfui = (input: any) => (input === "fufu" ? "pfui" : input);

  const data = {
    key1: "bla",
    key2: {
      key2_1: "bla",
      key2_2: "foobar",
    },
  };

  it("iterates through conversionSpec object, gets data from path (key of conversion spec), applies conversion functions to it", () => {
    const spec = {
      key1: bla2fufu,
      "key2.key2_1": bla2fufu,
    };

    const expectedOutput = {
      key1: "fufu",
      key2: {
        key2_1: "fufu",
        key2_2: "foobar",
      },
    };
    expect(convert(data, spec)).to.deep.equal(expectedOutput);
  });
  it("takes an array of functions and creates a pipeline", () => {
    const spec = {
      key1: [bla2fufu, fufu2pfui],
      "key2.key2_1": bla2fufu,
    };

    const expectedOutput = {
      key1: "pfui",
      key2: {
        key2_1: "fufu",
        key2_2: "foobar",
      },
    };
    expect(convert(data, spec)).to.deep.equal(expectedOutput);
  });
});

describe("convertPercentageToFraction", () => {
  it("converts float representing percentage to a fractional representation with max precision of 4 (for our backend)", () => {
    const percentage = 12.345978;
    const expectedOutput = 0.1235;

    expect(convertPercentageToFraction()(percentage)).to.be.equal(expectedOutput);
  });

  it("passes through an undefined value", () => {
    const percentage = undefined;
    const expectedOutput = undefined;

    expect(convertPercentageToFraction()(percentage)).to.be.equal(expectedOutput);
  });
});

describe("convertFractionToPercentage", () => {
  it("converts fractional representation to a float representing percentage", () => {
    const data = 0.2343;
    const expectedOutput = 23.43;

    expect(convertFractionToPercentage()(data)).to.be.equal(expectedOutput);
  });
  it("passes through an undefined value", () => {
    const data = undefined;
    const expectedOutput = undefined;

    expect(convertFractionToPercentage()(data)).to.be.equal(expectedOutput);
  });
  it("throws if there's a NaN", () => {
    expect(() => convertFractionToPercentage()(NaN)).to.throw;
  });
});

describe("parseStringToFloat", () => {
  it("tries to parse string to float and returns a float", () => {
    const goodString = "2.56";

    expect((parseStringToFloat()(goodString) as number).toString()).to.be.equal(goodString);
  });

  it("passes through a number", () => {
    const val1 = 2222;
    const val2 = 22.34;

    expect(parseStringToFloat()(val1)).to.be.equal(val1);
    expect(parseStringToFloat()(val2)).to.be.equal(val2);
  });

  it("returns undefined on bad input", () => {
    expect(parseStringToFloat()("")).to.be.undefined;
    expect(parseStringToFloat()("dateSchema")).to.be.undefined;
    expect(parseStringToFloat()(NaN)).to.be.undefined;
    expect(parseStringToFloat()(Infinity)).to.be.undefined;
    expect(parseStringToFloat()((null as unknown) as number)).to.be.undefined; //just to be sure
  });
});

describe("convertNumberToString", () => {
  it("converts number to string", () => {
    const input = 123;
    const output = "123";
    expect(convertNumberToString()(input)).to.be.equal(output);
  });
  it("passes through an undefined value", () => {
    const input = undefined;
    const output = undefined;
    expect(convertNumberToString()(input)).to.be.equal(output);
  });
  it("throws if input is NaN", () => {
    expect(() => convertNumberToString()(NaN)).to.throw;
  });
});

describe("removeEmptyField", () => {
  it("sets the field to undefined if it's empty", () => {
    const data = {
      "1": "some data",
      "2": "",
      "3": [],
      "4": null,
      "5": NaN,
      "6": 123,
    };

    const conversionSpec = {
      "1": removeEmptyField(),
      "2": removeEmptyField(),
      "3": removeEmptyField(),
      "4": removeEmptyField(),
      "5": removeEmptyField(),
      "6": removeEmptyField(),
    };

    const expectedOutput = {
      "1": "some data",
      "2": undefined,
      "3": undefined,
      "4": undefined,
      "5": undefined,
      "6": 123,
    };

    expect(convert(data, conversionSpec)).to.deep.equal(expectedOutput);
  });
});

describe("convertToPrecision", () => {
  it("imitates converting a floating point to a fixed precision number, returns undefined if input is invalid", () => {
    const float = 2.3456;
    const badData = parseInt("dateSchema", 2);
    const expectedResult = "2.35";
    expect((convertToPrecision(2)(float) as number).toString()).equal(expectedResult);
    expect(convertToPrecision(2)(badData)).is.undefined;
  });
});

describe("convertInArray", () => {
  it("iterates over an array of objects and applies respective conversion specs to its elements", () => {
    const conversionFunction1 = () => (data: any) => (data === "blo" ? "wow" : data);
    const conversionFunction2 = () => (data: any) => parseInt(data, 10);
    const conversionFunction3 = (n: number) => (data: any) => (data === n ? n * 100 : data);

    const data = {
      key1: [{ elementKey1: "bla", elementKey2: "25" }, { elementKey1: "blo", elementKey2: "27" }],
      key2: [{ elementKey1: "bla", elementKey2: "25" }, { elementKey1: "blo", elementKey2: "27" }],
    };

    const conversionSpecKey1 = {
      elementKey1: conversionFunction1(),
    };

    const conversionSpecKey2 = {
      elementKey1: conversionFunction1(),
      elementKey2: [conversionFunction2(), conversionFunction3(25)],
    };

    const conversionSpec = {
      key1: convertInArray(conversionSpecKey1),
      key2: convertInArray(conversionSpecKey2),
    };

    const expectedOutput = {
      key1: [{ elementKey1: "bla", elementKey2: "25" }, { elementKey1: "wow", elementKey2: "27" }],
      key2: [{ elementKey1: "bla", elementKey2: 2500 }, { elementKey1: "wow", elementKey2: 27 }],
    };

    expect(convert(data, conversionSpec)).to.be.deep.equal(expectedOutput);
  });
});

describe("generate shareholders", () => {
  it("returns an empty array if input is undefined", () => {
    const companyShares = 500;
    const expectedOutput: TShareholder[] = [];
    expect(generateShareholders(undefined, companyShares)).to.deep.eq(expectedOutput);
  });
  it("converts shareholder shares to percentage from company shares", () => {
    const companyShares = 500;
    const data = [
      {
        fullName: "shareholder1",
        shares: 123,
      },
      {
        fullName: "shareholder2",
        shares: 200,
      },
    ];
    const expectedOutput: TShareholder[] = [
      {
        fullName: "shareholder1",
        percentageOfShares: 25,
      },
      {
        fullName: "shareholder2",
        percentageOfShares: 40,
      },
      {
        fullName: "Others",
        percentageOfShares: 35,
      },
    ];
    expect(generateShareholders(data, companyShares)).to.deep.eq(expectedOutput);
  });
});
