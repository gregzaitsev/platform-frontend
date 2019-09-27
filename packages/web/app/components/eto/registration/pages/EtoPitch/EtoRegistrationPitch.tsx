import * as React from "react";
import { FormattedMessage } from "react-intl-phraseapp";

import { EtoPitchType } from "../../../../../lib/api/eto/EtoApi.interfaces.unsafe";
import { Button, EButtonLayout } from "../../../../shared/buttons/index";
import { FormHighlightGroup } from "../../../../shared/forms/FormHighlightGroup";
import {
  ArrayOfKeyValueFields,
  FormFieldError,
  FormFieldLabel,
  FormTextArea,
} from "../../../../shared/forms/index";
import { EtoFormBase } from "../../EtoFormBase";
import { Section } from "../../Shared";
import { TDispatchProps } from "../EtoVotingRights/EtoVotingRights";
import { connectEtoRegistrationPitch, TComponentProps } from "./connectEtoRegistrationPitch";

import * as styles from "../../Shared.module.scss";

const distributionSuggestions = ["Development", "Other"];

const EtoRegistrationPitchComponent = ({
  validationFn,
  initialValues,
  saveData,
  savingData,
}: TComponentProps & TDispatchProps) => (
  <EtoFormBase
    title={<FormattedMessage id="eto.form-progress-widget.company-information.product-vision" />}
    validationSchema={EtoPitchType.toYup()}
    validate={validationFn}
    initialValues={initialValues}
    onSubmit={saveData}
  >
    <Section>
      <FormTextArea
        className="my-2"
        label={<FormattedMessage id="eto.form.product-vision.inspiration" />}
        placeholder="Describe"
        name="inspiration"
        isWysiwyg={true}
      />

      <FormTextArea
        className="my-2"
        label={<FormattedMessage id="eto.form.product-vision.company-mission" />}
        placeholder="Describe"
        name="companyMission"
        isWysiwyg={true}
      />

      <FormTextArea
        className="my-2"
        label={<FormattedMessage id="eto.form.product-vision.product-vision" />}
        placeholder="Describe"
        name="productVision"
        isWysiwyg={true}
      />

      <FormTextArea
        className="my-2"
        label={<FormattedMessage id="eto.form.product-vision.problem-solved" />}
        placeholder="Describe"
        name="problemSolved"
        isWysiwyg={true}
      />

      <FormTextArea
        className="my-2"
        label={<FormattedMessage id="eto.form.product-vision.customer-group" />}
        placeholder="Describe"
        name="customerGroup"
        isWysiwyg={true}
      />

      <FormTextArea
        className="my-2"
        label={<FormattedMessage id="eto.form.product-vision.target-market-and-industry" />}
        placeholder="Describe"
        name="targetMarketAndIndustry"
        isWysiwyg={true}
      />

      <FormTextArea
        className="my-2"
        label={<FormattedMessage id="eto.form.product-vision.key-competitors" />}
        placeholder="Describe"
        name="keyCompetitors"
        isWysiwyg={true}
      />

      <FormTextArea
        className="my-2"
        label={<FormattedMessage id="eto.form.product-vision.selling-proposition" />}
        placeholder="Describe"
        name="sellingProposition"
        isWysiwyg={true}
      />

      <FormTextArea
        className="my-2"
        label={<FormattedMessage id="eto.form.product-vision.key-benefits-for-investors" />}
        placeholder="Describe"
        name="keyBenefitsForInvestors"
        isWysiwyg={true}
      />
      <FormHighlightGroup>
        <FormFieldLabel name="useOfCapital">
          <FormattedMessage id="eto.form.product-vision.use-of-capital" />
        </FormFieldLabel>

        <FormTextArea name="useOfCapital" placeholder="Detail" disabled={false} isWysiwyg={true} />
        <ArrayOfKeyValueFields
          name="useOfCapitalList"
          suggestions={distributionSuggestions}
          fieldNames={["description", "percent"]}
          suffix="%"
        />
        <FormFieldError name={"useOfCapitalList"} />
      </FormHighlightGroup>

      <FormTextArea
        className="my-2"
        label={<FormattedMessage id="eto.form.product-vision.market-traction" />}
        placeholder="Describe"
        name="marketTraction"
        isWysiwyg={true}
      />

      <FormTextArea
        className="my-2"
        label={<FormattedMessage id="eto.form.product-vision.roadmap" />}
        placeholder="Describe"
        name="roadmap"
        isWysiwyg={true}
      />

      <FormTextArea
        className="my-2"
        label={<FormattedMessage id="eto.form.product-vision.business-model" />}
        placeholder="Describe"
        name="businessModel"
        isWysiwyg={true}
      />

      <FormTextArea
        className="my-2"
        label={<FormattedMessage id="eto.form.product-vision.marketing-approach" />}
        placeholder="Describe"
        name="marketingApproach"
        isWysiwyg={true}
      />
    </Section>
    <Section className={styles.buttonSection}>
      <Button
        layout={EButtonLayout.PRIMARY}
        type="submit"
        isLoading={savingData}
        data-test-id="eto-registration-product-vision-submit"
      >
        <FormattedMessage id="eto.form.product-vision.save" />
      </Button>
    </Section>
  </EtoFormBase>
);

const EtoRegistrationPitch = connectEtoRegistrationPitch(EtoRegistrationPitchComponent);
export { EtoRegistrationPitch, EtoRegistrationPitchComponent };
