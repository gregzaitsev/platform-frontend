import { storiesOf } from "@storybook/react";
import * as React from "react";

import { ETxSenderType } from "../../../../modules/tx/types";
import { withModalBody } from "../../../../utils/storybookHelpers.unsafe";
import { TxSuccessLayout } from "./TxSuccess";

const txData: React.ComponentProps<typeof TxSuccessLayout> = {
  blockId: 4623487932,
  txHash: "af908098b968d7564564362c51836",
  type: ETxSenderType.WITHDRAW,
  additionalData: {
    value: "5500000000000000000",
    walletAddress: "0xfb6916095ca1df60bb79ce92ce3ea74c37c5d359",
    to: "0xfb6916095ca1df60bb79ce92ce3ea74c37c5d359",
    amount: "5500000000000000000",
    amountEur: "5500000000000000000",
    cost: "313131232312331212",
    costEur: "313131232312331212",
    total: "313131232312331212",
    totalEur: "313131232312331212",
    inputValue: "5500000000000000000",
  },
  txData: {
    to: "0xfb6916095ca1df60bb79ce92ce3ea74c37c5d359",
    value: "5500000000000000000",
    from: "0xfb6916095ca1df60bb79ce92ce3ea74c37c5d359",
    gas: "28288283",
    gasPrice: "224523523",
  },
};

storiesOf("TxSuccess", module)
  .addDecorator(withModalBody())
  .add("default", () => <TxSuccessLayout {...txData} />);
