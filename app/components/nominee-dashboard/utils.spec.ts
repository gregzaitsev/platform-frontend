import { expect } from "chai";

import { prepareSetupAccountSteps } from "./utils";

describe("prepareSetupAccountSteps", () => {
  it("iterates over data and sets the first not done element open", () => {
    const data = [
      {
        key: "1",
        conditionCompleted: true,
        title: "title 1",
        component: "component 1",
      },
      {
        key: "2",
        conditionCompleted: false,
        title: "title 2",
        component: "component 2",
      },
      {
        key: "3",
        conditionCompleted: false,
        title: "title 3",
        component: "component 3",
      },
    ];

    const expectedData = [
      {
        key: "1",
        done: true,
        isOpen: false,
        title: "title 1",
        component: "component 1",
      },
      {
        key: "2",
        done: false,
        isOpen: true,
        title: "title 2",
        component: "component 2",
      },
      {
        key: "3",
        done: false,
        isOpen: false,
        title: "title 3",
        component: "component 3",
      },
    ];

    expect(prepareSetupAccountSteps(data)).to.deep.eq(expectedData);
  });
});
