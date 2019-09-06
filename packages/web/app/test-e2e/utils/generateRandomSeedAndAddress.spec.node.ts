import { expect } from "chai";

import { validateAddress } from "../../modules/web3/utils";
import { generateRandomSeedAndAddress } from "./generateRandomSeedAndAddress";

describe("generateRandomSeedAndAddress", () => {
  it("generates seed and password", async () => {
    const { seed, address } = await generateRandomSeedAndAddress("m/44'/60'/0'");

    expect(seed.length).to.eq(24);
    expect(validateAddress(address)).to.be.true;
  });
});
