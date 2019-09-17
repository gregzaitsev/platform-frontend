import { expect } from "chai";

import { convertToBigInt } from "../../../../utils/Number.utils";
import { getPossibleMaxUlps } from "./utils";

describe("getPossibleMaxUlps", () => {
  it("should correctly select value", () => {
    expect(getPossibleMaxUlps(convertToBigInt("10278127.1988124"), "10278127.19")).to.be.eq(
      convertToBigInt("10278127.1988124"),
    );
    expect(getPossibleMaxUlps(convertToBigInt("10278127.1988124"), "124.28")).to.be.eq(
      convertToBigInt("124.28"),
    );

    // with precision provided
    expect(getPossibleMaxUlps(convertToBigInt("10278127.1988124"), "10278127.19")).to.be.eq(
      convertToBigInt("10278127.1988124"),
    );
    expect(getPossibleMaxUlps(convertToBigInt("10278127.1988124"), "124.28")).to.be.eq(
      convertToBigInt("124.28"),
    );
  });
});
