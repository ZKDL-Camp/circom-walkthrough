import { expect } from "chai";
import { ethers, zkit } from "hardhat";

import { buildNullifier, poseidonHash, signRawPoseidon } from "@scripts";

import { IdentityAuth } from "@/generated-types/zkit";

describe("IdentityAuth", () => {
  let identityAuth: IdentityAuth;

  before(async () => {
    identityAuth = await zkit.getCircuit("IdentityAuth");
  });

  it("should correctly build nullifier hash and sign some data", async () => {
    const privateKeyRaw = BigInt(poseidonHash(ethers.hexlify(ethers.randomBytes(28)))) >> 1n;

    const messageHash = poseidonHash(ethers.hexlify(ethers.randomBytes(28)));
    const signature = signRawPoseidon(privateKeyRaw, messageHash);

    const nullifier = buildNullifier(privateKeyRaw);

    const proof = await identityAuth.generateProof({
      sk_i: privateKeyRaw,
      messageHash: BigInt(messageHash),
      signatureR8x: signature.R8[0],
      signatureR8y: signature.R8[1],
      signatureS: signature.S,
    });

    expect(BigInt(proof.publicSignals.publicKey)).to.equal(BigInt(nullifier));

    expect(await identityAuth.verifyProof(proof)).to.be.true;

    expect(
      await identityAuth.verifyProof({
        ...proof,
        publicSignals: {
          ...proof.publicSignals,
          publicKey: BigInt(buildNullifier(privateKeyRaw)) - 1n,
        },
      }),
    ).to.be.false;
  });

  it("should verify the proof", async () => {
    const privateKeyRaw = BigInt(poseidonHash(ethers.hexlify(ethers.randomBytes(32)))) >> 1n;

    const messageHash = poseidonHash(ethers.hexlify(ethers.randomBytes(32)));
    const signature = signRawPoseidon(privateKeyRaw, messageHash);

    const verifier = await ethers.deployContract("IdentityAuthVerifier");

    const proof = await identityAuth.generateProof({
      sk_i: privateKeyRaw,
      messageHash: BigInt(messageHash),
      signatureR8x: signature.R8[0],
      signatureR8y: signature.R8[1],
      signatureS: signature.S,
    });

    expect(identityAuth).to.useSolidityVerifier(verifier).and.verifyProof(proof);
  });
});
