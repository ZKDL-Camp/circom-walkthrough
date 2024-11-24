// LICENSE: MIT
pragma circom 2.1.6;

template Math() {
    signal output res;

    signal input a;

    signal input b;
    signal input c;

    a * (1 - a) === 0;

    signal mul1 <== a * b;
    signal mul2 <== a * c;
    signal res1 <== mul1 * mul2;

    signal res2 <== (1 - a) * (b + c);

    res1 + res2 ==> res;
}
