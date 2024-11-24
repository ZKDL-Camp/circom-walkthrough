(async () => {
  const chai = await import("chai");
  const chaiAsPromised = await import("chai-as-promised");
  chai.default.use(chaiAsPromised.default);
})();
