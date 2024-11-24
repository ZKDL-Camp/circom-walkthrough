// LICENSE: MIT
pragma circom 2.1.6;

include "circomlib/circuits/babyjub.circom";
include "circomlib/circuits/poseidon.circom";

include "BuildPublicKey.circom";
include "ExtractPoseidonPK.circom";
include "OptimizedEdDSAPoseidonVerifier.circom";

template IdentityAuth() {
    // Public Outputs
    signal output publicKey; // Poseidon3(sk_i, Poseidon1(sk_i), eventID)

    // Public Inputs
    signal input messageHash;

    // Private Inputs
    signal input sk_i;
    signal input eventID;

    signal input signatureR8x;
    signal input signatureR8y;
    signal input signatureS;

    // Verify PublicKey
    component publicKeyBuilder = BuildPublicKey();

    sk_i ==> publicKeyBuilder.sk_i;
    eventID ==> publicKeyBuilder.eventID;

    publicKey <== publicKeyBuilder.publicKey;

    component getPoseidonPK = ExtractPoseidonPK();
    sk_i ==> getPoseidonPK.privateKey;

    component sigVerifier = OptimizedEdDSAPoseidonVerifier();
    sigVerifier.enabled <== 1;

    sigVerifier.Ax <== getPoseidonPK.Ax;
    sigVerifier.Ay <== getPoseidonPK.Ay;
    sigVerifier.S <== signatureS;
    sigVerifier.R8x <== signatureR8x;
    sigVerifier.R8y <== signatureR8y;
    sigVerifier.M <== messageHash;
}
