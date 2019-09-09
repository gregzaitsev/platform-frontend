import BigNumber from "bignumber.js";
import { expect } from "chai";

import {
  bankQuantize,
  convertToBigInt,
  getPossibleMaxUlps,
  iso2002Quantize,
  isZero,
  normalize,
  subtractBankFee,
} from "./Number.utils";

describe("convertToBigInt", () => {
  it("converts decimal currencies to bigInt representation", () => {
    expect(convertToBigInt("123.4567")).to.eq("123456700000000000000");
    expect(convertToBigInt("123.4567", 6)).to.eq("123456700");
    expect(convertToBigInt("123.4567", 2)).to.eq("12346");
    expect(convertToBigInt("65.4321", 2)).to.eq("6544");
  });
});

describe("normalize", () => {
  it("should normalize given number to a specified range", () => {
    expect(normalize({ min: 0, max: 100 }, 100)).to.eq(1);
    expect(normalize({ min: 0, max: 100 }, 0)).to.eq(0);
    expect(normalize({ min: 0, max: 100 }, 25)).to.eq(0.25);
    expect(normalize({ min: 0, max: 100 }, 80)).to.eq(0.8);
  });
});

describe("isZero", () => {
  it("should correctly recognize zeros", () => {
    expect(isZero("000000000000000000")).to.be.true;
    expect(isZero("364458900000000000")).to.be.false;
  });
});

describe("iso2002Quantize", () => {
  it("should correctly quantize value", () => {
    expect(iso2002Quantize(1.0001000001)).to.be.eq("1.00010");
    expect(iso2002Quantize(1.123)).to.be.eq("1.12300");

    // half-up
    expect(iso2002Quantize(1.123456)).to.be.eq("1.12346");

    // quantization from str
    expect(iso2002Quantize("128.123456789012345678")).to.be.eq("128.12346");

    // quantization from BigNumber
    expect(iso2002Quantize(new BigNumber("128.123456789012345678"))).to.be.eq("128.12346");
  });
});

describe("bankQuantize", () => {
  it("should correctly quantize value", () => {
    expect(bankQuantize(1.0001000001)).to.be.eq("1.00");
    expect(bankQuantize(1.123)).to.be.eq("1.12");

    // down
    expect(bankQuantize(1.126999)).to.be.eq("1.12");

    // quantization from str
    expect(bankQuantize("128.123456789012345678")).to.be.eq("128.12");

    // quantization from BigNumber
    expect(bankQuantize(new BigNumber("128.123456789012345678"))).to.be.eq("128.12");
  });
});

describe("getPossibleMaxUlps", () => {
  it("should correctly quantize value", () => {
    expect(getPossibleMaxUlps(convertToBigInt("10278127.1988124"), "10278127.1988")).to.be.eq(
      convertToBigInt("10278127.1988124"),
    );
    expect(getPossibleMaxUlps(convertToBigInt("10278127.1988124"), "124.28")).to.be.eq(
      convertToBigInt("124.28"),
    );

    // with precision provided
    expect(getPossibleMaxUlps(convertToBigInt("10278127.1988124"), "10278127.19", 2)).to.be.eq(
      convertToBigInt("10278127.1988124"),
    );
    expect(getPossibleMaxUlps(convertToBigInt("10278127.1988124"), "124.28", 2)).to.be.eq(
      convertToBigInt("124.28"),
    );
  });
});

describe("subtractBankFee", () => {
  it("should correctly calculate value with fee subtracted", () => {
    // fee 61.1116 -> round_up 61.12
    expect(subtractBankFee("12222.32", "0.005")).to.be.eq("12161.20");
    // fee 562.35473 -> round_up 562.36
    expect(subtractBankFee("80336.39", "0.007")).to.be.eq("79774.03");
    // fee 59.49588 -> round_up 59.50
    expect(subtractBankFee("14873.97", "0.004")).to.be.eq("14814.47");
  });
});
