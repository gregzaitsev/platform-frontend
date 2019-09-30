import { expect } from "chai";
import * as React from "react";
import { spy } from "sinon";

import { createMount } from "../../../../../test/createMount";
import { testCompany, testContract, testEto } from "../../../../../test/fixtures";
import {
  createIntegrationTestsSetup,
  setupFakeClock,
  wrapWithProviders,
} from "../../../../../test/integrationTestUtils.unsafe";
import { tid } from "../../../../../test/testUtils";
import { actions } from "../../../../modules/actions";
import { watchEto } from "../../../../modules/eto/sagas";
import { EETOStateOnChain } from "../../../../modules/eto/types";
import { neuCall } from "../../../../modules/sagasUtils";
import { EtoStatusManager } from "./EtoStatusManager/EtoStatusManager";

actions.eto.loadEtoPreview = spy(() => ({ type: "loadEtoPreview" })) as any;

const eto = {
  etos: {
    [testEto.previewCode]: testEto,
  },
  companies: {
    [testEto.companyId]: testCompany,
  },
  contracts: {
    [testEto.previewCode]: {
      ...testContract,
      timedState: EETOStateOnChain.Whitelist,
    },
  },
};

const initialState = {
  auth: {
    user: {
      userId: "0x353d3030AF583fc0e547Da80700BbD953F330A4b",
    },
  },
  eto,
};

const props = {
  isEmbedded: false,
  eto: {
    ...testEto,
    company: testCompany,
    contract: {
      ...testContract,
      timedState: EETOStateOnChain.Whitelist,
    },
  },
};

//TODO test all eto state changes, including EtoCard
describe("EtoStatusManager state change", () => {
  const clock = setupFakeClock();

  beforeEach(() => {
    ((actions.eto.loadEtoPreview as unknown) as sinon.SinonSpy).resetHistory();
  });

  it("counter shows a loading state and EtoStateManager dispatches the update action on nextStateDate", async () => {
    clock.fakeClock.setSystemTime(
      new Date(testContract.startOfStates[EETOStateOnChain.Public]).valueOf() - 2000,
    );

    const { store, sagaMiddleware } = createIntegrationTestsSetup({
      initialState,
    });

    sagaMiddleware.run(function*(): any {
      yield neuCall(watchEto, props.eto.previewCode);
    });

    const component = createMount(
      wrapWithProviders(() => <EtoStatusManager {...props} />, { store }),
    );

    expect(component.find(tid("eto-whitelist-countdown")).length).to.eq(1);
    expect(component.find(tid("eto-whitelist-countdown-finished")).length).to.eq(0);
    expect(actions.eto.loadEtoPreview).to.not.be.called;

    await clock.fakeClock.tickAsync(4000);
    component.update();

    expect(component.find(tid("eto-whitelist-countdown")).length).to.eq(0);
    expect(component.find(tid("eto-whitelist-countdown-finished")).length).to.eq(1);
    expect(actions.eto.loadEtoPreview).to.be.calledOnceWith(props.eto.previewCode);
  });

  it("shows the countdown and then calls the final function", async () => {
    clock.fakeClock.setSystemTime(
      new Date(testContract.startOfStates[EETOStateOnChain.Signing]).valueOf() - 2000,
    );

    initialState.eto.contracts[testEto.previewCode].timedState = EETOStateOnChain.Public;
    props.eto.contract.timedState = EETOStateOnChain.Public;

    const { store, sagaMiddleware } = createIntegrationTestsSetup({
      initialState,
    });

    sagaMiddleware.run(function*(): any {
      yield neuCall(watchEto, props.eto.previewCode);
    });

    const component = createMount(
      wrapWithProviders(() => <EtoStatusManager {...props} />, { store }),
    );

    expect(component.find(tid("eto-whitelist-countdown-finished")).length).to.eq(0);
    expect(component.find(tid("investment-widget")).length).to.eq(1);
    expect(component.find(tid("end-time-widget-running")).length).to.eq(1);
    expect(component.find(tid("end-time-widget-finished")).length).to.eq(0);
    expect(actions.eto.loadEtoPreview).to.not.be.called;

    await clock.fakeClock.tickAsync(4000);
    component.update();

    expect(component.find(tid("end-time-widget-running")).length).to.eq(0);
    expect(component.find(tid("end-time-widget-finished")).length).to.eq(1);
    expect(actions.eto.loadEtoPreview).to.be.calledOnceWith(props.eto.previewCode);
  });
});
