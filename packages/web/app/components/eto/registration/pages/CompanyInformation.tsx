import { FormikProps, withFormik } from "formik";
import * as React from "react";
import { FormattedMessage } from "react-intl-phraseapp";
import { Col, Row } from "reactstrap";
import { setDisplayName } from "recompose";
import { compose } from "redux";

import { COMPANY_TAGS_LIMIT } from "../../../../config/constants";
import {
  EtoCompanyInformationType,
  TPartialCompanyEtoData,
} from "../../../../lib/api/eto/EtoApi.interfaces.unsafe";
import { actions } from "../../../../modules/actions";
import { selectIssuerCompany } from "../../../../modules/eto-flow/selectors";
import { EEtoFormTypes } from "../../../../modules/eto-flow/types";
import { appConnect } from "../../../../store";
import { Button, EButtonLayout } from "../../../shared/buttons";
import { FormField, FormTextArea } from "../../../shared/forms";
import { FormSingleFileUpload } from "../../../shared/forms/fields/FormSingleFileUpload.unsafe";
import { EMimeType } from "../../../shared/forms/fields/utils.unsafe";
import { EtoTagWidget, generateTagOptions } from "../../shared/EtoTagWidget.unsafe";
import { EtoFormBase } from "../EtoFormBase.unsafe";
import { Section } from "../Shared";

import * as styles from "../Shared.module.scss";

interface IStateProps {
  loadingData: boolean;
  savingData: boolean;
  stateValues: TPartialCompanyEtoData;
}

interface IDispatchProps {
  saveData: (values: TPartialCompanyEtoData) => void;
}

const tagList = ["Science", "Technology", "Blockchain", "Medical", "Research"];

type IProps = IStateProps & IDispatchProps;

const EtoRegistrationCompanyInformationComponent = (
  props: FormikProps<TPartialCompanyEtoData> & IProps,
) => (
  <EtoFormBase
    data-test-id="eto.form.company-information"
    title="Company Information"
    validator={EtoCompanyInformationType.toYup()}
  >
    <Section>
      <FormField
        label={<FormattedMessage id="eto.form.company-information.brand-name" />}
        name="brandName"
      />
      <FormField
        label={<FormattedMessage id="eto.form.company-information.website" />}
        name="companyWebsite"
      />
      <FormField
        label={<FormattedMessage id="eto.form.company-information.company-tagline" />}
        name="companyOneliner"
        charactersLimit={50}
      />

      <FormTextArea
        label={<FormattedMessage id="eto.form.company-information.company-description" />}
        placeholder="Please describe your company, this description will be displayed on the listing page (max. 250 characters)."
        name="companyDescription"
        charactersLimit={250}
      />
      <FormTextArea
        label={<FormattedMessage id="eto.form.company-information.founders-quote" />}
        placeholder="Please add a quote from your founder that will be displayed on the top of the listing page before you start whitelist subscriptions (max. 250 characters)."
        name="keyQuoteFounder"
        charactersLimit={250}
      />
      <FormTextArea
        label={<FormattedMessage id="eto.form.company-information.investor-quote" />}
        placeholder="Please add a quote from one of your significant supporters, investors or from press. It will be displayed on the listing page under the company description and should validate company’s position (max. 250 characters)."
        name="keyQuoteInvestor"
        charactersLimit={250}
      />

      <EtoTagWidget
        selectedTagsLimit={COMPANY_TAGS_LIMIT}
        options={generateTagOptions(tagList)}
        name="categories"
        className="mb-4"
      />

      <Row>
        <Col>
          <FormSingleFileUpload
            dimensions={{ width: 150, height: 150 }}
            name="companyLogo"
            label={<FormattedMessage id="eto.form.company-information.logo" />}
            acceptedFiles={[EMimeType.JPEG, EMimeType.PNG]}
            fileFormatInformation="*150 x 150 png"
            className="mb-3"
            data-test-id="eto-registration-company-logo"
          />
        </Col>
        <Col>
          <FormSingleFileUpload
            dimensions={{ width: 1250, height: 400 }}
            name="companyBanner"
            label={<FormattedMessage id="eto.form.company-information.banner" />}
            acceptedFiles={[EMimeType.JPEG, EMimeType.PNG]}
            fileFormatInformation="*1250 x 400 png"
            className="mb-3"
            data-test-id="eto-registration-company-banner"
          />
        </Col>
        <Col>
          <FormSingleFileUpload
            dimensions={{ width: 768, height: 400 }}
            name="companyPreviewCardBanner"
            label={<FormattedMessage id="eto.form.company-information.preview-image" />}
            acceptedFiles={[EMimeType.JPEG, EMimeType.PNG]}
            fileFormatInformation="*768 x 400 png"
            className="mb-3"
            data-test-id="companyPreviewCardBanner"
          />
        </Col>
      </Row>
    </Section>
    <Section className={styles.buttonSection}>
      <Button
        layout={EButtonLayout.PRIMARY}
        type="submit"
        isLoading={props.savingData}
        data-test-id="eto-registration-company-information-submit"
      >
        <FormattedMessage id="form.button.save" />
      </Button>
    </Section>
  </EtoFormBase>
);

const EtoRegistrationCompanyInformation = compose<React.FunctionComponent>(
  setDisplayName(EEtoFormTypes.CompanyInformation),
  appConnect<IStateProps, IDispatchProps>({
    stateToProps: s => ({
      loadingData: s.etoFlow.loading,
      savingData: s.etoFlow.saving,
      stateValues: selectIssuerCompany(s) as TPartialCompanyEtoData,
    }),
    dispatchToProps: dispatch => ({
      saveData: (data: TPartialCompanyEtoData) => {
        dispatch(actions.etoFlow.saveDataStart({ companyData: data, etoData: {} }));
      },
    }),
  }),
  withFormik<IProps, TPartialCompanyEtoData>({
    validationSchema: EtoCompanyInformationType.toYup(),
    mapPropsToValues: props => props.stateValues,
    handleSubmit: (values, props) => props.props.saveData(values),
  }),
)(EtoRegistrationCompanyInformationComponent);

export { EtoRegistrationCompanyInformation, EtoRegistrationCompanyInformationComponent };
