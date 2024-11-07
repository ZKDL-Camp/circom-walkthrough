// LICENSE: MIT
pragma circom 2.1.6;

template Multiplier() {
    signal input a;
    signal input b;
    signal output c;

    c <== a * b;
}
