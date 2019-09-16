import * as cn from "classnames";
import { Formik } from "formik";
import * as React from "react";
import { FormattedMessage } from "react-intl-phraseapp";

import { generateCampaigningValidation } from "../../../../../lib/api/eto/EtoPledgeApi.interfaces.unsafe";
import { Button, ButtonSize, ButtonWidth } from "../../../../shared/buttons";
import { Money } from "../../../../shared/formatters/Money";
import {
  ECurrency,
  ENumberInputFormat,
  ENumberOutputFormat,
} from "../../../../shared/formatters/utils";
import { CheckboxLayout, EInputSize, FormDeprecated, FormInput } from "../../../../shared/forms";
import { Tooltip } from "../../../../shared/tooltips";

import * as styles from "../EtoOverviewStatus.module.scss";

export enum CampaigningFormState {
  VIEW,
  EDIT,
}

export interface ICampaigningActivatedInvestorWidgetLayoutProps {
  pledgedAmount: number | "";
  consentToRevealEmail: boolean;
  backNow: (amount: number) => void;
  formState: CampaigningFormState;
  showMyEmail: (consentToRevealEmail: boolean) => void;
  changePledge: () => void;
  deletePledge: () => void;
  minPledge: number;
  maxPledge?: number;
}

const CampaigningActivatedInvestorApprovedWidgetLayout: React.FunctionComponent<
  ICampaigningActivatedInvestorWidgetLayoutProps
> = ({
  pledgedAmount,
  consentToRevealEmail,
  backNow,
  formState,
  showMyEmail,
  changePledge,
  deletePledge,
  minPledge,
  maxPledge,
}) => (
  <>
    <div className={styles.group}>
      <label htmlFor="consentToRevealEmail" className={styles.label}>
        <FormattedMessage id="shared-component.eto-overview.reveal-my-email" />
        <Tooltip
          content={<FormattedMessage id="shared-component.eto-overview.reveal-my-email.tooltip" />}
        />
      </label>
      <div className={styles.value}>
        <CheckboxLayout
          name="consentToRevealEmail"
          inputId="consentToRevealEmail"
          checked={consentToRevealEmail}
          onChange={event => showMyEmail(event.target.checked)}
        />
      </div>
    </div>
    {formState === CampaigningFormState.VIEW ? (
      <div className={styles.group}>
        <div className={styles.label} data-test-id="campaigning-your-commitment">
          <FormattedMessage id="eto-overview.campaigning.your-commitment" />
          <br />
          <Money
            value={pledgedAmount}
            inputFormat={ENumberInputFormat.FLOAT}
            valueType={ECurrency.EUR}
            outputFormat={ENumberOutputFormat.ONLY_NONZERO_DECIMALS}
          />
        </div>
        <div className={styles.value}>
          <button onClick={changePledge} className={styles.changePledge}>
            <FormattedMessage id="shared-component.eto-overview.change" />
          </button>{" "}
          <FormattedMessage id="shared-component.eto-overview.or" />{" "}
          <button onClick={deletePledge} className={styles.deletePledge}>
            <FormattedMessage id="shared-component.eto-overview.delete" />
          </button>{" "}
          <FormattedMessage id="shared-component.eto-overview.your-pledge" />{" "}
        </div>
      </div>
    ) : (
      <Formik<{ amount: number | "" }>
        initialValues={{ amount: pledgedAmount }}
        onSubmit={({ amount }) => backNow(Number(amount))}
        validationSchema={generateCampaigningValidation(minPledge, maxPledge)}
      >
        <FormDeprecated className={styles.group}>
          <div className={cn(styles.label)}>
            <FormattedMessage id="eto-overview.campaigning.indicate-commitment" />
            <FormInput size={EInputSize.SMALL} name="amount" prefix="€" maxLength={8} type="text" />
          </div>
          <div className={cn(styles.value, styles.backNow)}>
            <Button
              data-test-id="eto-bookbuilding-back-now"
              type="submit"
              size={ButtonSize.SMALL}
              width={ButtonWidth.BLOCK}
            >
              <FormattedMessage id="shared-component.eto-overview.back-now" />
            </Button>
          </div>
        </FormDeprecated>
      </Formik>
    )}
  </>
);

export { CampaigningActivatedInvestorApprovedWidgetLayout };
