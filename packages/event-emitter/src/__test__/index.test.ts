
jest.spyOn(global.console, "log");

describe("main", () => {
  it("prints a message", () => {
    console.log('jest')
  });
});
