import * as cn from "classnames";
import { Formik, FormikErrors, FormikProps, yupToFormErrors } from "formik";
import * as React from "react";
import { FormattedMessage } from "react-intl-phraseapp";
import { compose, withHandlers } from "recompose";
import { NumberSchema } from "yup";

import { ITxData } from "../../../../lib/web3/types";
import * as YupTS from "../../../../lib/yup-ts";
import { actions } from "../../../../modules/actions";
import { EValidationState } from "../../../../modules/tx/sender/reducer";
import {
  selectTxAdditionalData,
  selectTxGasCostEthUlps,
  selectTxGasCostEurUlps,
  selectTxTotalEthUlps,
  selectTxTotalEurUlps,
  selectTxValidationState,
  selectTxValueEurUlps,
} from "../../../../modules/tx/sender/selectors";
import {
  ETxSenderType,
  IAdditionalValidationData,
  IDraftType,
  TAdditionalDataByType,
} from "../../../../modules/tx/types";
import { ETH_ADDRESS_SIZE } from "../../../../modules/tx/utils";
import {
  selectLiquidEtherBalance,
  selectLiquidEtherBalanceEuroAmount,
  selectMaxAvailableEther,
} from "../../../../modules/wallet/selectors";
import { selectEthereumAddressWithChecksum } from "../../../../modules/web3/selectors";
import { validateAddress } from "../../../../modules/web3/utils";
import { appConnect } from "../../../../store";
import { OmitKeys } from "../../../../types";
import { Button } from "../../../shared/buttons";
import { EButtonLayout } from "../../../shared/buttons/Button";
import { MoneyNew } from "../../../shared/formatters/Money";
import {
  ECurrency,
  ENumberInputFormat,
  ENumberOutputFormat,
  ERoundingMode,
  selectDecimalPlaces,
  toFixedPrecision,
} from "../../../shared/formatters/utils";
import { Form } from "../../../shared/forms";
import { FormFieldBoolean } from "../../../shared/forms/fields/FormFieldBoolean";
import { FormLabel } from "../../../shared/forms/fields/FormFieldLabel";
import { FormInput } from "../../../shared/forms/fields/FormInput";
import { EInputTheme } from "../../../shared/forms/layouts/InputLayout";
import { EHeadingSize, Heading } from "../../../shared/Heading";
import { EtherscanAddressLink } from "../../../shared/links/EtherscanLink";
import { MaskedNumberInput } from "../../../shared/MaskedNumberInput";
import { ESize, ETextPosition, ETheme, MoneySuiteWidget } from "../../../shared/MoneySuiteWidget";
import { DataRow } from "../shared/DataRow";
import { WarningLabel } from "./WarningLabel";

import * as styles from "./Withdraw.module.scss";

type TAdditionalData = IAdditionalValidationData &
  TAdditionalDataByType<typeof ETxSenderType.WITHDRAW>;

interface IStateProps {
  maxEther: string;
  validationState?: EValidationState;
  ethAmount: string;
  ethEuroAmount: string;
  walletAddress: string;
  gasPrice: string;
  gasPriceEur: string;
  total: string;
  totalEur: string;
  additionalData?: TAdditionalData;
  valueEur: string;
}

interface IWithdrawData {
  value: string;
  to: string;
  acceptWarnings: boolean;
}

interface IHandlersProps {
  onValidateHandler: (values: IWithdrawData) => void | FormikErrors<IWithdrawData>;
}

interface IDispatchProps {
  onValidate: (txDraft: IDraftType) => void;
  onAccept: (tx: Partial<ITxData>) => void;
}

type TProps = IStateProps & OmitKeys<IDispatchProps, "onValidate"> & IHandlersProps;

const getWithdrawFormSchema = () =>
  YupTS.object({
    to: YupTS.string().enhance(v =>
      v.test(
        "isEthereumAddress",
        (
          <FormattedMessage id="modals.tx-sender.withdraw-flow.withdraw-component.errors.not-ethereum-address" />
        ) as any,
        (value: string | undefined) => {
          // allow empty values as they should be handled by required yup validation
          if (value === undefined) {
            return true;
          }

          return validateAddress(value);
        },
      ),
    ),
    value: YupTS.number().enhance((v: NumberSchema) => v.moreThan(0)),
  }).toYup();

const WithdrawLayout: React.FunctionComponent<TProps> = ({
  onAccept,
  onValidateHandler,
  ethAmount,
  gasPrice,
  gasPriceEur,
  total,
  totalEur,
  validationState,
  maxEther,
  additionalData,
  valueEur,
}) => (
  <section className={styles.contentWrapper}>
    <Heading
      size={EHeadingSize.HUGE}
      level={4}
      className={styles.withSpacing}
      decorator={false}
      disableTransform={true}
    >
      <FormattedMessage id="modal.sent-eth.title" />
    </Heading>

    <Formik<IWithdrawData>
      validate={onValidateHandler}
      // Initial values are used only when user is returning to this screen from Summary
      initialValues={{
        to: (additionalData && additionalData.to) || "",
        value: additionalData
          ? toFixedPrecision({
              value: additionalData.inputValue,
              decimalPlaces: selectDecimalPlaces(ECurrency.ETH),
              inputFormat: ENumberInputFormat.ULPS,
            })
          : "",
        acceptWarnings: false,
      }}
      // Initial valid is only set to true when user is returning to this screen from Summary
      isInitialValid={additionalData && !!additionalData.amount}
      onSubmit={onAccept}
    >
      {({
        isValid,
        isValidating,
        setFieldValue,
        setFieldTouched,
        values,
        errors,
      }: FormikProps<IWithdrawData>) => (
        <Form>
          <section className={styles.withSpacing}>
            <FormLabel for="to" className={styles.label}>
              <FormattedMessage id="modal.sent-eth.to-address" />
            </FormLabel>
            <FormInput
              name="to"
              data-test-id="modals.tx-sender.withdraw-flow.withdraw-component.to-address"
              maxLength={ETH_ADDRESS_SIZE}
              charactersLimit={ETH_ADDRESS_SIZE}
              theme={EInputTheme.BOX}
            />
            {!errors.to && values.to && (
              <EtherscanAddressLink className={cn(styles.etherscanLink)} address={values.to}>
                <FormattedMessage id="modal.sent-eth.view-on-etherscan" />
              </EtherscanAddressLink>
            )}
          </section>

          <DataRow
            caption={<FormattedMessage id="modal.sent-eth.available-balance" />}
            value={
              <MoneyNew
                className={styles.money}
                value={ethAmount}
                inputFormat={ENumberInputFormat.ULPS}
                outputFormat={ENumberOutputFormat.ONLY_NONZERO_DECIMALS}
                valueType={ECurrency.ETH}
              />
            }
          />

          <section className="text-right small mb-4">
            <Button
              data-test-id="modals.tx-sender.withdraw-flow.withdraw-component.whole-balance"
              onClick={() => {
                setFieldValue(
                  "value",
                  toFixedPrecision({
                    value: maxEther,
                    roundingMode: ERoundingMode.DOWN,
                    inputFormat: ENumberInputFormat.ULPS,
                    decimalPlaces: selectDecimalPlaces(
                      ECurrency.ETH,
                      ENumberOutputFormat.ONLY_NONZERO_DECIMALS,
                    ),
                  }),
                  true,
                );
                setFieldTouched("value", true, true);
              }}
              layout={EButtonLayout.INLINE}
            >
              <FormattedMessage id="modal.sent-eth.whole-balance" />
            </Button>
          </section>

          <section>
            <FormLabel for="value" className={styles.label}>
              <FormattedMessage id="modal.sent-eth.amount" />
            </FormLabel>
            <MaskedNumberInput
              className="text-right"
              storageFormat={ENumberInputFormat.FLOAT}
              valueType={ECurrency.ETH}
              outputFormat={ENumberOutputFormat.FULL}
              data-test-id="modals.tx-sender.withdraw-flow.withdraw-component.value"
              name="value"
              value={values.value}
              onChangeFn={value => {
                setFieldValue("value", value);
                setFieldTouched("value", true);
              }}
              returnInvalidValues={true}
              showUnits={true}
              theme={EInputTheme.BOX}
            />
          </section>

          <section className="text-right mb-4">
            <small>
              {"= "}
              <MoneyNew
                value={
                  isValid
                    ? valueEur
                    : "0" /* Show 0 if form is invalid due of initially populated state */
                }
                inputFormat={ENumberInputFormat.ULPS}
                valueType={ECurrency.EUR}
                outputFormat={ENumberOutputFormat.ONLY_NONZERO_DECIMALS}
              />
            </small>
          </section>

          <DataRow
            className={styles.withSpacing}
            caption={<FormattedMessage id="modal.sent-eth.transaction-fee" />}
            value={
              <MoneySuiteWidget
                currency={ECurrency.ETH}
                largeNumber={
                  isValid
                    ? gasPrice
                    : "0" /* Show 0 if form is invalid due of initially populated state */
                }
                value={isValid ? gasPriceEur : "0"}
                currencyTotal={ECurrency.EUR}
                data-test-id="modals.tx-sender.withdraw-flow.summary.cost"
                theme={ETheme.BLACK}
                size={ESize.MEDIUM}
                textPosition={ETextPosition.RIGHT}
                outputFormat={ENumberOutputFormat.ONLY_NONZERO_DECIMALS_ROUND_UP}
              />
            }
          />

          <hr className={styles.separator} />

          <DataRow
            className={cn(styles.sectionBig, styles.withSpacing)}
            caption={<FormattedMessage id="modal.sent-eth.total" />}
            value={
              <MoneySuiteWidget
                currency={ECurrency.ETH}
                largeNumber={
                  isValid
                    ? total
                    : "0" /* Show 0 if form is invalid due of initially populated state */
                }
                value={isValid ? totalEur : "0"}
                currencyTotal={ECurrency.EUR}
                data-test-id="modals.tx-sender.withdraw-flow.summary.cost"
                theme={ETheme.BLACK}
                size={ESize.HUGE}
                textPosition={ETextPosition.RIGHT}
                outputFormat={ENumberOutputFormat.ONLY_NONZERO_DECIMALS_ROUND_UP}
              />
            }
          />

          {/* Hide if values are empty even if there is a warning in state*/}
          {additionalData && additionalData.warning && values.value && values.to && (
            <section className="mt-4">
              <FormFieldBoolean
                name="acceptWarnings"
                label={<WarningLabel warning={additionalData.warning} />}
              />
            </section>
          )}

          {isValid && validationState === EValidationState.IS_NOT_ACCEPTING_ETHER && (
            <span
              className="text-warning"
              data-test-id="modals.tx-sender.withdraw-flow.withdraw-component.not-accepting-ether"
            >
              <FormattedMessage id="modal.sent-eth.not-accepting-ether" />
            </span>
          )}

          <section className="mt-4 text-center">
            <Button
              type="submit"
              disabled={
                !isValid ||
                isValidating ||
                validationState !== EValidationState.VALIDATION_OK ||
                (additionalData && additionalData.warning && !values.acceptWarnings)
              }
              data-test-id="modals.tx-sender.withdraw-flow.withdraw-component.send-transaction-button"
            >
              {isValidating || (!validationState && !values.acceptWarnings) ? (
                <FormattedMessage id="modal.sent-eth.button-loading" />
              ) : (
                <FormattedMessage id="modal.sent-eth.button" />
              )}
            </Button>
          </section>
        </Form>
      )}
    </Formik>
  </section>
);

const Withdraw = compose<TProps, {}>(
  appConnect<IStateProps, IDispatchProps>({
    stateToProps: state => ({
      ethAmount: selectLiquidEtherBalance(state),
      ethEuroAmount: selectLiquidEtherBalanceEuroAmount(state),
      walletAddress: selectEthereumAddressWithChecksum(state),
      maxEther: selectMaxAvailableEther(state),
      validationState: selectTxValidationState(state),
      gasPrice: selectTxGasCostEthUlps(state),
      gasPriceEur: selectTxGasCostEurUlps(state),
      total: selectTxTotalEthUlps(state),
      totalEur: selectTxTotalEurUlps(state),
      additionalData: selectTxAdditionalData<typeof ETxSenderType.WITHDRAW>(state),
      valueEur: selectTxValueEurUlps(state),
    }),
    dispatchToProps: d => ({
      onAccept: (tx: Partial<ITxData>) => d(actions.txSender.txSenderAcceptDraft(tx)),
      onValidate: (txDraft: IDraftType) => d(actions.txValidator.txSenderValidateDraft(txDraft)),
    }),
  }),
  withHandlers<IStateProps & IDispatchProps, {}>({
    onValidateHandler: ({ onValidate }) => (values: IWithdrawData) => {
      const schema = getWithdrawFormSchema();

      try {
        schema.validateSync(values, { abortEarly: false });
      } catch (errors) {
        return yupToFormErrors(errors);
      }

      onValidate({
        to: values.to,
        value: values.value,
        type: ETxSenderType.WITHDRAW,
        acceptWarnings: values.acceptWarnings,
      });

      return undefined;
    },
  }),
)(WithdrawLayout);

export { Withdraw, WithdrawLayout };
