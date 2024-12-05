// LICENSE: MIT
pragma circom 2.1.6;

template Math() {
    signal output r;

    signal input x1;

    signal input x2;
    signal input x3;

    x1 * x1 === x1;

    signal mult <== x2 * x3;
    signal selectMult <== x1 * mult;

    (1 - x1) * (x2 + x3) + selectMult ==> r;
}
