import { EventEmitter } from "events";
import { expectSaga } from "redux-saga-test-plan";

import { generateTokenWithdrawTransaction } from "./sagas";
import { ContractsService } from "../../../../lib/web3/ContractsService";
import { IERC223Token } from "../../../../lib/contracts/IERC223Token";
import { createMock } from "../../../../../test/testUtils";
import { IAppState } from "../../../../store";
import { getDummyLightWalletMetadata } from "../../../web3/fixtures";

describe("Token Transfer Sagas", () => {
  describe("transactionGenerator", () => {
    it.only("connects to event from web3Manager", async () => {
      const web3ManagerMock = new EventEmitter();

      const state: Partial<IAppState> = {
        web3: {
          connected: false,
          previousConnectedWallet: getDummyLightWalletMetadata(),
        },
      };

      const contractsMock = createMock(ContractsService, {
        getERC223: (to: string) => Promise.resolve(createMock(IERC223Token, {})),
      });

      await expectSaga(
        generateTokenWithdrawTransaction,
        {
          web3Manager: web3ManagerMock,
          contractsService: contractsMock,
        },
        {
          tokenAddress: "0x8a588917c83462C0B602904F6cE6a558aeBc5683",
          to: "0x8a588917c83462C0B602904F6cE6a558aeBc5683",
          valueUlps: "1232323",
        },
      )
        .withState(state)
        .run();
    });
  });
});
