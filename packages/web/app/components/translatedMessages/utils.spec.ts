import { expect } from "chai";

import { createMessage } from "./utils";

enum TestMessageType {
  TEST_MESSAGE = "testMessage",
}

describe("translation utils/createMessage", () => {
  it("creates a TMessage object", () => {
    const msgType = TestMessageType.TEST_MESSAGE;
    const msgPayload = { a: 1, b: "blabla", c: [1, 2, 3] };
    const expectedOutput = {
      messageType: msgType,
      messageData: msgPayload,
    };
    //@ts-ignore because createMessage only accepts TranslatedMessageType from ./messages
    expect(createMessage(msgType, msgPayload)).to.be.deep.equal(expectedOutput);
  });
});
