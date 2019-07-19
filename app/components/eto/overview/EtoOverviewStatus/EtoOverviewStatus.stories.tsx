import { storiesOf } from "@storybook/react";
import * as moment from "moment";
import * as React from "react";

import { testEto } from "../../../../../test/fixtures";
import {
  EETOStateOnChain,
  IEtoContractData,
  TEtoWithCompanyAndContract,
} from "../../../../modules/eto/types";
import { withStore } from "../../../../utils/storeDecorator.unsafe";
import { withMockedDate } from "../../../../utils/storybookHelpers.unsafe";
import { EtoOverviewStatus } from "./EtoOverviewStatus";

const eto: TEtoWithCompanyAndContract = {
  ...testEto,
  preMoneyValuationEur: 10000,
  existingCompanyShares: 10,
  equityTokensPerShare: 10,
  publicDiscountFraction: 0.2,
  whitelistDiscountFraction: 0.3,
  maxPledges: 100,
  maxTicketEur: 1000,
  minTicketEur: 1,
  equityTokenName: "TokenName",
  equityTokenSymbol: "TKN",
  company: { ...testEto.company, brandName: "BrandName" },
  contract: {
    ...testEto.contract!,
    timedState: EETOStateOnChain.Whitelist,
  },
};
// 2018-11-16T05:03:56.000Z
// Fri Nov 23 2018 06:03:56 GMT+0100
const dummyNow = new Date("2018-10-16T05:03:56+00:00");

storiesOf("ETO/EtoOverviewStatus", module)
  .addDecorator(
    withStore({
      eto: {
        etos: { [eto.previewCode]: eto },
        companies: { [eto.companyId]: eto.company },
        contracts: { [eto.previewCode]: eto.contract },
      },
    }),
  )
  .addDecorator(withMockedDate(dummyNow))
  .add("default", () => <EtoOverviewStatus eto={eto} publicView={false} isEmbedded={true} />)
  .add("not public", () => <EtoOverviewStatus eto={eto} isEmbedded={false} publicView={false} />)
  .add("with whitelist discount", () => (
    <EtoOverviewStatus eto={eto} isEmbedded={true} publicView={false} />
  ))
  .add("without discount", () => (
    <EtoOverviewStatus
      eto={{ ...eto, publicDiscountFraction: 0 }}
      isEmbedded={true}
      publicView={false}
    />
  ))
  .add("whitelisted not eligible", () => (
    <EtoOverviewStatus eto={{ ...eto }} isEmbedded={true} publicView={false} />
  ))
  .add("successful", () => (
    <EtoOverviewStatus
      eto={{
        ...eto,
        isBookbuilding: true,
        contract: { ...eto.contract, timedState: EETOStateOnChain.Claim } as IEtoContractData,
      }}
      isEmbedded={true}
      publicView={false}
    />
  ))
  .add("max cap exceeded whitelisted", () => (
    <EtoOverviewStatus
      eto={{
        ...eto,
        contract: {
          ...eto.contract,
          startOfStates: {
            ...eto.contract!.startOfStates,
            [EETOStateOnChain.Public]: moment()
              .add(7, "days")
              .toDate(),
          },
        } as IEtoContractData,
      }}
      isEmbedded={true}
      publicView={false}
    />
  ))
  .add("max cap exceeded public", () => (
    <EtoOverviewStatus
      eto={{
        ...eto,
        contract: {
          ...eto.contract,
          timedState: EETOStateOnChain.Public,
        } as IEtoContractData,
      }}
      isEmbedded={true}
      publicView={false}
    />
  ));
