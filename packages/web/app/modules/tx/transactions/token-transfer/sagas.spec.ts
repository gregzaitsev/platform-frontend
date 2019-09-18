import { expectSaga } from "redux-saga-test-plan";
import { call } from "redux-saga/effects";
import * as matchers from "redux-saga-test-plan/matchers";
import { spy } from "sinon";

import { generateTokenWithdrawTransaction, isERC223TransferIsSupported } from "./sagas";
import { ContractsService } from "../../../../lib/web3/ContractsService";
import { IERC223Token } from "../../../../lib/contracts/IERC223Token";
import { createMock } from "../../../../../test/testUtils";
import { IAppState } from "../../../../store";
import { getDummyLightWalletMetadata } from "../../../web3/fixtures";
import { Web3Manager } from "../../../../lib/web3/Web3Manager/Web3Manager";
import { EtherToken } from "../../../../lib/contracts/EtherToken";
import BigNumber from "bignumber.js";
import { DeferredTransactionWrapper, ITxParams } from "../../../../lib/contracts/typechain-runtime";
import { TxData } from "web3";
import { neuCall } from "../../../sagasUtils";

describe("Token Transfer Sagas", () => {
  const generalMockedState: Partial<IAppState> = {
    web3: {
      connected: false,
      previousConnectedWallet: getDummyLightWalletMetadata(),
    },
    gas: {
      gasPrice: { standard: "1000", fast: "0", fastest: "0", safeLow: "0" },
      loading: false,
    },
  };

  const tokenAddress = "0x8a588917c83462C0B602904F6cE6a558aeBc5683";
  const to = "0x8a588917c83462C0B602904F6cE6a558aeBc5683";

  const web3ManagerMock = {
    internalWeb3Adapter: { isSmartContract: (to: string) => true } as any,
    estimateGas: (txData: Partial<TxData>) => Promise.resolve(1),
    estimateGasWithOverhead: (txData: Partial<TxData>) => Promise.resolve("9"),
  } as any;

  const Erc223TransferTx = Symbol();
  const Erc223TransferData = Symbol();
  const EtherTokenTransferData = Symbol();

  const contractsMock = createMock(ContractsService, {
    etherToken: createMock(EtherToken, {
      rawWeb3Contract: {
        transfer: {
          "address,uint256,bytes": {
            getData: (to: string | BigNumber, amount: number | BigNumber, data: string) =>
              EtherTokenTransferData,
          },
        },
      },
    }),
    getERC223: (to: string) =>
      Promise.resolve(
        createMock(IERC223Token, {
          transferTx: (to: string | BigNumber, amount: number | BigNumber) =>
            ({
              getData: () => Erc223TransferTx,
            } as any),
          rawWeb3Contract: {
            transfer: {
              "address,uint256,bytes": {
                getData: () => Erc223TransferData,
              },
            },
          },
        }),
      ),
  });

  describe.only("transactionGenerator", () => {
    it("Uses Erc233 Transfer type", async () => {
      await expectSaga(
        generateTokenWithdrawTransaction,
        {
          web3Manager: web3ManagerMock,
          contractsService: contractsMock,
        },
        {
          tokenAddress,
          to,
          valueUlps: "1232323",
        },
      )
        .withState(generalMockedState)
        .provide([[matchers.call.fn(isERC223TransferIsSupported), false]])
        .returns({
          to: tokenAddress,
          from: "0xfB6916095ca1df60bB79Ce92cE3Ea74c37c5d359",
          data: Erc223TransferTx,
          value: "0",
          gasPrice: generalMockedState.gas!.gasPrice!.standard,
          estimatedGasWithOverhead: "9",
        })
        .run();
    });
    it("Uses ERC20 Transfer type", async () => {
      await expectSaga(
        generateTokenWithdrawTransaction,
        {
          web3Manager: web3ManagerMock,
          contractsService: contractsMock,
        },
        {
          tokenAddress,
          to,
          valueUlps: "1232323",
        },
      )
        .withState(generalMockedState)
        .provide([[matchers.call.fn(isERC223TransferIsSupported), true]])
        .returns({
          to: tokenAddress,
          from: "0xfB6916095ca1df60bB79Ce92cE3Ea74c37c5d359",
          data: Erc223TransferData,
          value: "0",
          gasPrice: generalMockedState.gas!.gasPrice!.standard,
          estimatedGasWithOverhead: "9",
        })
        .run();
    });
  });
});
