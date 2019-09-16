import { storiesOf } from "@storybook/react";
import * as React from "react";

import { ETransactionErrorType } from "../../../../modules/tx/sender/reducer";
import { ETxSenderType } from "../../../../modules/tx/types";
import { convertToBigInt } from "../../../../utils/Number.utils";
import { withStore } from "../../../../utils/storeDecorator.unsafe";
import { withModalBody } from "../../../../utils/storybookHelpers.unsafe";
import { TxErrorLayout } from "./TxError";

const baseTxData = {
  blockId: 4623487932,
  txHash: "af908098b968d7564564362c51836",
  txData: {
    from: "0x0020d330ef4de5c07d4271e0a67e8fd67a21d523",
    gas: "0x7b0c",
    gasPrice: "0xb2d05e00",
    hash: "0xe0cbf82ceee3d0a84b762fccf7eefbb4744bf68a6c0e9038a7db57ec8f2346f4",
    input: "0x00",
    nonce: "0x0",
    status: "pending",
    to: "0x16cd5aC5A1b77FB72032E3A09E91A98bB21D8988",
    value: "0x8ac7230489e80000",
    blockHash: undefined,
    blockNumber: undefined,
    chainId: undefined,
    transactionIndex: undefined,
  },
  error: ETransactionErrorType.REVERTED_TX,
};

const txData: React.ComponentProps<typeof TxErrorLayout> = {
  type: ETxSenderType.WITHDRAW,
  additionalData: {
    to: "0xfb6916095ca1df60bb79ce92ce3ea74c37c5d359",
    amount: "5500000000000000000",
    amountEur: "5500000000000000000",
    total: "313131232312331212",
    totalEur: "313131232312331212",
  },
  ...baseTxData,
};

const investTxData: React.ComponentProps<typeof TxErrorLayout> = {
  type: ETxSenderType.INVEST,
  additionalData: {
    eto: {
      etoId: "123",
      companyName: "Test Co",
      existingShareCapital: 20,
      preMoneyValuationEur: 100,
      equityTokensPerShare: 10,
      investmentCalculatedValues: {
        sharePrice: 100 / (20 * 10),
      },
    },
    equityTokens: "211",
    estimatedReward: convertToBigInt("125"),
    etherPriceEur: "2542.22",
    gasCostEth: convertToBigInt("0.124"),
    investmentEth: convertToBigInt("120"),
    investmentEur: convertToBigInt("22506"),
    isIcbm: false,
  },
  ...baseTxData,
};

storiesOf("TxError", module)
  .addDecorator(withModalBody())
  .addDecorator(
    withStore({
      txSender: txData,
      web3: { wallet: { address: "0x00b30CC2cc22c9820d47a4E0C9E1A54455bA0883" }, connected: true },
    }),
  )
  .add("default", () => <TxErrorLayout {...investTxData} />)
  .add("withdraw transaction error", () => <TxErrorLayout {...txData} />);
