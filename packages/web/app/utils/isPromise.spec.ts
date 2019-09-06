import { expect } from "chai";

import { isPromise } from "./isPromise";

describe("isPromise", () => {
  it("should detect native promises", () => {
    expect(isPromise(Promise.resolve("test"))).to.be.true;
  });

  it("should detect not promises", () => {
    expect(isPromise(5)).to.be.false;
  });
});
