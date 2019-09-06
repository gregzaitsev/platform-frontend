import { expect } from "chai";

import { generateSeedAndAddress } from "./generateSeedAndAddress";

describe("generateSeedAndAddress", () => {
  it("generates seed and password", async () => {
    const { seed, address } = await generateSeedAndAddress("m/44'/60'/0'");

    expect(seed.length).to.eq(24);
    expect(address.length).to.eq(42);
  });
});
