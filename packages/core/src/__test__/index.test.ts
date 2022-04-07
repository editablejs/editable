import main from "../index";

jest.spyOn(global.console, "log");

describe("main", () => {
  it("prints a message", () => {
    main();
  });
});
