import { expect } from "chai";

import { isValidLink } from "./utils";

describe("isValidLink", () => {
  it("should return true", () => {
    expect(isValidLink("https://neufund.org/api/newsletter/subscriptions/123/topics/2141")).to.be
      .true;
    expect(isValidLink("http://neufund.org/api/newsletter/subscriptions/123/topics/2141")).to.be
      .true;
    expect(isValidLink("https://neufund.net/api/newsletter/subscriptions/123/topics/2141")).to.be
      .true;
    expect(isValidLink("https://neufund.io/api/newsletter/subscriptions/123/topics/2141")).to.be
      .true;
    expect(isValidLink("https://localhost:9090/api/newsletter/subscriptions/123/topics/2141")).to.be
      .true;
  });

  it("should return false", () => {
    expect(isValidLink("https://google.com/api/newsletter/subscriptions/123/topics/2141")).to.be
      .false;
    expect(isValidLink("https://neufund.net/api/kyc/do_anything")).to.be.false;
    expect(isValidLink("https://neufund.io/api/newsletter/123/topics/2141")).to.be.false;
    expect(isValidLink("https://localhost:9090/api/subscriptions/123/topics/2141")).to.be.false;
  });
});
