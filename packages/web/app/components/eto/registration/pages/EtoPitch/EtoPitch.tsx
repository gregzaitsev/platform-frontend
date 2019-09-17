import * as React from "react";
import { FormattedMessage } from "react-intl-phraseapp";

import {
  EtoPitchType,
} from "../../../../../lib/api/eto/EtoApi.interfaces.unsafe";
import { Button, EButtonLayout } from "../../../../shared/buttons/index";
import { ArrayOfKeyValueFields, FormFieldError, FormTextArea } from "../../../../shared/forms/index";
import { FormHighlightGroup } from "../../../../shared/forms/FormHighlightGroup";
import { EtoFormBase } from "../../EtoFormBase";
import { Section } from "../../Shared";
import { connectEtoRegistrationPitch, TComponentProps } from "./connectEtoPitch";
import { TDispatchProps } from "../EtoVotingRights/EtoVotingRights";

import * as styles from "../../Shared.module.scss";

const distributionSuggestions = ["Development", "Other"];

const EtoRegistrationPitchComponent = (props: TComponentProps & TDispatchProps) => (
  <EtoFormBase
    title={<FormattedMessage id="eto.form-progress-widget.company-information.product-vision" />}
    validationSchema={EtoPitchType.toYup()}
    validate={props.validationFn}
    initialValues={props.initialValues}
    onSubmit={props.saveData}
  >
    <Section>
      <FormTextArea
        className="my-2"
        label={<FormattedMessage id="eto.form.product-vision.inspiration" />}
        placeholder="Describe"
        name="inspiration"
      />

      <FormTextArea
        className="my-2"
        label={<FormattedMessage id="eto.form.product-vision.company-mission" />}
        placeholder="Describe"
        name="companyMission"
      />

      <FormTextArea
        className="my-2"
        label={<FormattedMessage id="eto.form.product-vision.product-vision" />}
        placeholder="Describe"
        name="productVision"
      />

      <FormTextArea
        className="my-2"
        label={<FormattedMessage id="eto.form.product-vision.problem-solved" />}
        placeholder="Describe"
        name="problemSolved"
      />

      <FormTextArea
        className="my-2"
        label={<FormattedMessage id="eto.form.product-vision.customer-group" />}
        placeholder="Describe"
        name="customerGroup"
      />

      <FormTextArea
        className="my-2"
        label={<FormattedMessage id="eto.form.product-vision.target-market-and-industry" />}
        placeholder="Describe"
        name="targetMarketAndIndustry"
      />

      <FormTextArea
        className="my-2"
        label={<FormattedMessage id="eto.form.product-vision.key-competitors" />}
        placeholder="Describe"
        name="keyCompetitors"
      />

      <FormTextArea
        className="my-2"
        label={<FormattedMessage id="eto.form.product-vision.selling-proposition" />}
        placeholder="Describe"
        name="sellingProposition"
      />

      <FormTextArea
        className="my-2"
        label={<FormattedMessage id="eto.form.product-vision.key-benefits-for-investors" />}
        placeholder="Describe"
        name="keyBenefitsForInvestors"
      />
      <FormHighlightGroup title={<FormattedMessage id="eto.form.product-vision.use-of-capital" />}>
        <FormTextArea name="useOfCapital" placeholder="Detail" disabled={false} />
        <ArrayOfKeyValueFields
          name="useOfCapitalList"
          suggestions={distributionSuggestions}
          fieldNames={["description", "percent"]}
        />
        <FormFieldError name={"useOfCapitalList"} />
      </FormHighlightGroup>

      <FormTextArea
        className="my-2"
        label={<FormattedMessage id="eto.form.product-vision.market-traction" />}
        placeholder="Describe"
        name="marketTraction"
      />

      <FormTextArea
        className="my-2"
        label={<FormattedMessage id="eto.form.product-vision.roadmap" />}
        placeholder="Describe"
        name="roadmap"
      />

      <FormTextArea
        className="my-2"
        label={<FormattedMessage id="eto.form.product-vision.business-model" />}
        placeholder="Describe"
        name="businessModel"
      />

      <FormTextArea
        className="my-2"
        label={<FormattedMessage id="eto.form.product-vision.marketing-approach" />}
        placeholder="Describe"
        name="marketingApproach"
      />
    </Section>
    <Section className={styles.buttonSection}>
      <Button
        layout={EButtonLayout.PRIMARY}
        type="submit"
        isLoading={props.savingData}
        data-test-id="eto-registration-product-vision-submit"
      >
        <FormattedMessage id="eto.form.product-vision.save" />
      </Button>
    </Section>
  </EtoFormBase>
);

const EtoRegistrationPitch = connectEtoRegistrationPitch(EtoRegistrationPitchComponent);
export { EtoRegistrationPitch, EtoRegistrationPitchComponent };
