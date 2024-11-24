import { expect } from "chai";
import { zkit } from "hardhat";

import { Math, PrivateMath } from "@/generated-types/zkit";

describe("Math Circuit", () => {
  let math: Math;

  before(async () => {
    math = await zkit.getCircuit("Math");
  });

  it("should revert if trying to generate proof when a is not binary", async () => {
    const inputs: PrivateMath = {
      a: 2n,
      b: 3n,
      c: 6n,
    };

    await expect(math.generateProof(inputs)).eventually.to.be.rejectedWith(
      "Error: Assert Failed. Error in template Math_0 line: 12",
    );
  });

  it("should multiply two numbers if a = 1", async () => {
    const inputs: PrivateMath = {
      a: 1n,
      b: 3n,
      c: 6n,
    };

    const proof = await math.generateProof(inputs);
    expect(proof.publicSignals.res).to.equal("18");
  });

  it("should add two numbers if a = 0", async () => {
    const inputs: PrivateMath = {
      a: 0n,
      b: 3n,
      c: 6n,
    };

    const proof = await math.generateProof(inputs);
    expect(proof.publicSignals.res).to.equal("9");
  });
});
