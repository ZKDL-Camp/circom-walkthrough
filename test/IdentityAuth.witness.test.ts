import { expect } from "chai";
import { ethers } from "hardhat";

import { Circomkit, WitnessTester } from "circomkit";

import { buildNullifier, poseidonHash, signRawPoseidon } from "@scripts";

// @ts-ignore
import { Scalar } from "ffjavascript";

import * as fs from "node:fs";

async function writeWtns(wtnsFileName: string, witnessArray: bigint[]) {
  const binFileUtils = require("@iden3/binfileutils");

  const prime = Scalar.fromString("21888242871839275222246405745257275088548364400416034343698204186575808495617");

  const fd = await binFileUtils.createBinFile(wtnsFileName, "wtns", 2, 2);

  // Calculate byte size (n8) for encoding each witness element
  const n8 = (Math.floor((Scalar.bitLength(prime) - 1) / 64) + 1) * 8;

  // Header Section (Section ID 1)
  await binFileUtils.startWriteSection(fd, 1);
  await fd.writeULE32(n8); // Write field element byte size
  await binFileUtils.writeBigInt(fd, prime, n8); // Write prime modulus
  await fd.writeULE32(witnessArray.length);
  await binFileUtils.endWriteSection(fd);

  // Witness Section (Section ID 2)
  await binFileUtils.startWriteSection(fd, 2);
  for (const witness of witnessArray) {
    await binFileUtils.writeBigInt(fd, Scalar.mod(witness, prime), n8); // Ensure witness is within field
  }
  await binFileUtils.endWriteSection(fd);

  await fd.close();
}

async function generateProof(wtnsFileName: string) {
  const snarkjs = require("snarkjs");

  const { proof, publicSignals } = await snarkjs.groth16.prove(
    "zkit/artifacts/circuits/IdentityAuth.circom/IdentityAuth.zkey",
    wtnsFileName,
  );

  return { proof, publicSignals };
}

describe("IdentityAuth Witness", () => {
  const AUTH_NAME = "IdentityAuth";

  let circuit: WitnessTester<["sk_i", "messageHash", "signatureR8x", "signatureR8y", "signatureS"], ["publicKey"]>;

  before(async () => {
    const circomkit = new Circomkit({
      optimization: 1,
      dirBuild: "/Users/kyrylr/Desktop/temp/circom-walkthrough/generated",
    });

    circuit = await circomkit.WitnessTester(AUTH_NAME, {
      file: "templates/IdentityAuth",
      template: "IdentityAuth",
    });
  });

  it("should correctly verify the witness", async () => {
    const privateKeyRaw = BigInt(poseidonHash(ethers.hexlify(ethers.randomBytes(32)))) >> 1n;

    const messageHash = poseidonHash(ethers.hexlify(ethers.randomBytes(32)));
    const signature = signRawPoseidon(privateKeyRaw, messageHash);

    const inputs = {
      sk_i: privateKeyRaw,
      messageHash: BigInt(messageHash),
      signatureR8x: signature.R8[0],
      signatureR8y: signature.R8[1],
      signatureS: signature.S,
    };

    const output = await circuit.compute(inputs, ["publicKey"]);

    expect(BigInt(output["publicKey"].toString())).to.equal(BigInt(buildNullifier(privateKeyRaw)));
  });

  it("should correctly brake the witness", async () => {
    const privateKeyRaw = 14293131380590364977321678307167668994523257149283608421565962523620017225645n;

    const messageHash = poseidonHash(ethers.hexlify(ethers.randomBytes(32)));
    const signature = signRawPoseidon(privateKeyRaw, messageHash);

    const inputs = {
      sk_i: privateKeyRaw,
      messageHash: BigInt(messageHash),
      signatureR8x: signature.R8[0],
      signatureR8y: signature.R8[1],
      signatureS: signature.S,
    };

    const witness = await circuit.calculateWitness(inputs);
    const badWitness = await circuit.editWitness(witness, {
      "main.publicKey": BigInt(111111231111),
    });

    fs.writeFileSync("IdentityAuth.witness.json", JSON.stringify(badWitness, null, 2));

    await writeWtns("IdentityAuth.wtns", badWitness);

    const { publicSignals } = await generateProof("IdentityAuth.wtns");

    expect(publicSignals[0]).to.be.equal("111111231111");
  });
});
