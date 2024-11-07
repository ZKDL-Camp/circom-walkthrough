import { expect } from "chai";
import { ethers, zkit } from "hardhat";

import { Circomkit, WitnessTester } from "circomkit";

import { buildNullifier, EVENT_ID, poseidonHash, signRawPoseidon } from "@scripts";

describe("IdentityAuth Witness", () => {
  const AUTH_NAME = "IdentityAuth";
  const MULTIPLIER_NAME = "Multiplier";

  let circuit: WitnessTester<['sk_i', 'eventID', 'messageHash', 'signatureR8x', 'signatureR8y', 'signatureS'], ['nullifier']>;
  let multiplier2: WitnessTester<['a', 'b'], ['c']>;

  before(async () => {
    const circomkit = new Circomkit();

    circuit = await circomkit.WitnessTester(AUTH_NAME, {
      file: 'templates/IdentityAuth',
      template: 'IdentityAuth',
    });
    multiplier2 = await circomkit.WitnessTester(MULTIPLIER_NAME, {
      file: 'templates/Multiplier',
      template: 'Multiplier',
      pubs: ['b'],
    });
  });

  it("should correctly verify the witness", async () => {
    const privateKeyRaw = BigInt(poseidonHash(ethers.hexlify(ethers.randomBytes(32)))) >> 1n;

    const messageHash = poseidonHash(ethers.hexlify(ethers.randomBytes(32)));
    const signature = signRawPoseidon(privateKeyRaw, messageHash);

    const witness = {
      sk_i: privateKeyRaw,
      eventID: BigInt(EVENT_ID),
      messageHash: BigInt(messageHash),
      signatureR8x: signature.R8[0],
      signatureR8y: signature.R8[1],
      signatureS: signature.S,
    }

    const output = await circuit.compute(witness, ['nullifier']);

    expect(BigInt(output["nullifier"].toString())).to.equal(BigInt(buildNullifier(privateKeyRaw, EVENT_ID)));
  });

  it.only("should correctly brake the witness", async () => {
    const witness = {
      a: 2,
      b: 3,
    }

    const output = await multiplier2.compute(witness, ['c']);

    console.log(output);
  });
});
