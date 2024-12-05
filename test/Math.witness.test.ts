import { expect } from "chai";

import { Circomkit, WitnessTester } from "circomkit";

// @ts-ignore
const readR1cs = require("r1csfile").readR1cs;

import { babyJub } from "@iden3/js-crypto";

import { PrivateMath } from "@/generated-types/zkit";

import loadSymbols from "@/test/loadsyms";
import r1csPrint from "@/test/r1cs_print";


describe("Math Witness", () => {
  const AUTH_NAME = "Math";

  let circuit: WitnessTester<["x1", "x2", "x3"], ["r"]>;

  before(async () => {
    const circomkit = new Circomkit({
      optimization: 1,
      dirBuild: "/Users/kyrylr/Desktop/temp/circom-walkthrough/generated",
    });

    circuit = await circomkit.WitnessTester(AUTH_NAME, {
      file: "templates/Math",
      template: "Math",
    });
  });

  function prettifyConstraints(r1cs: any, numberOfVars: number, constraints: Record<string, Uint8Array>[]): bigint[][] {
    return constraints.map((c: Record<string, Uint8Array>) => {
      const positionInArray = parseInt(Object.keys(c)[0], 10);
      const value = BigInt(r1cs.curve.Fr.toString(Object.values(c)[0]));

      const result = Array(numberOfVars).fill(0n);
      result[positionInArray] = value;

      return result;
    });
  }

  it.skip("pretty print of r1cs file ", async () => {
    const r1cs = await readR1cs("zkit/artifacts/circuits/Math.circom/Math.r1cs");
    const sym = await loadSymbols("zkit/artifacts/circuits/Math.circom/Math.sym");

    r1csPrint(r1cs, sym, console);
  });

  it("should correctly read r1cs file", async () => {
    const r1cs = await readR1cs("zkit/artifacts/circuits/Math.circom/Math.r1cs");
    expect(r1cs.nConstraints).to.equal(4);

    const numberOfVars = r1cs.nVars;
    const constraint1 = prettifyConstraints(r1cs, numberOfVars, r1cs.constraints[0]);
    const constraint2 = prettifyConstraints(r1cs, numberOfVars, r1cs.constraints[1]);
    const constraint3 = prettifyConstraints(r1cs, numberOfVars, r1cs.constraints[2]);
    const constraint4 = prettifyConstraints(r1cs, numberOfVars, r1cs.constraints[3]);

    /* prettier-ignore */
    expect(constraint1[0]).to.deep.equal([ 0n, 0n, 1n, 0n, 0n, 0n, 0n ]);
    /* prettier-ignore */
    expect(constraint1[1]).to.deep.equal([ 0n, 0n, 1n, 0n, 0n, 0n, 0n ]);
    /* prettier-ignore */
    expect(constraint1[2]).to.deep.equal([ 0n, 0n, 1n, 0n, 0n, 0n, 0n ]);

    /* prettier-ignore */
    expect(constraint2[0]).to.deep.equal([ 0n, 0n, 0n, babyJub.F.negone, 0n, 0n, 0n ]);
    /* prettier-ignore */
    expect(constraint2[1]).to.deep.equal([ 0n, 0n, 0n, 0n, 1n, 0n, 0n ]);
    /* prettier-ignore */
    expect(constraint2[2]).to.deep.equal([ 0n, 0n, 0n, 0n, 0n, babyJub.F.negone, 0n ]);

    /* prettier-ignore */
    expect(constraint3[0]).to.deep.equal([ 0n, 0n, babyJub.F.negone, 0n, 0n, 0n, 0n ]);
    /* prettier-ignore */
    expect(constraint3[1]).to.deep.equal([ 0n, 0n, 0n, 0n, 0n, 1n, 0n ]);
    /* prettier-ignore */
    expect(constraint3[2]).to.deep.equal([ 0n, 0n, 0n, 0n, 0n, 0n, babyJub.F.negone ]);

    /* prettier-ignore */
    expect(constraint4[0]).to.deep.equal([ babyJub.F.negone, 0n, 0n, 0n, 0n, 0n, 0n ]);
    /* prettier-ignore */
    expect(constraint4[1]).to.deep.equal([ 0n, 0n, 0n, 1n, 0n, 0n, 0n ]);
    /* prettier-ignore */
    expect(constraint4[2]).to.deep.equal([ 0n, babyJub.F.negone, 0n, 0n, 0n, 0n, 0n ]);
  });

  it("should correctly build witness", async () => {
    const inputs: PrivateMath = {
      x1: 1n,
      x2: 3n,
      x3: 4n,
    };

    const witness = await circuit.calculateWitness(inputs);

    expect(witness[0]).to.equal(1n);
    expect(witness[1]).to.equal(12n);
    expect(witness[2]).to.equal(1n);
    expect(witness[3]).to.equal(3n);
    expect(witness[4]).to.equal(4n);
    expect(witness[5]).to.equal(12n);
    expect(witness[6]).to.equal(12n);
  });
});
