import * as cn from "classnames";
import { Formik, FormikErrors, FormikProps, yupToFormErrors } from "formik";
import * as React from "react";
import { FormattedMessage } from "react-intl-phraseapp";
import { compose, withHandlers } from "recompose";
import { NumberSchema } from "yup";

import { ITxData } from "../../../../lib/web3/types";
import * as YupTS from "../../../../lib/yup-ts.unsafe";
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
  EAdditionalValidationDataWarning,
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
import { doesUserHaveEnoughEther, validateAddress } from "../../../../modules/web3/utils";
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
import { DataRow, DataRowSeparator } from "../shared/DataRow";

import * as ethIcon from "../../../../assets/img/eth_icon.svg";
import * as txSuccess from "../../../../assets/img/icon_txn_status_success.svg";
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
  withdrawAll: boolean;
  allowNewAddress: boolean;
  allowSmartContract: boolean;
}

interface IHandlersProps {
  onValidateHandler: (values: IWithdrawData) => void | FormikErrors<IWithdrawData>;
}

interface IDispatchProps {
  onValidate: (txDraft: IDraftType) => void;
  onAccept: (tx: Partial<ITxData>) => void;
}

type TProps = IStateProps & OmitKeys<IDispatchProps, "onValidate"> & IHandlersProps;

export const hasWarning = (
  error: EAdditionalValidationDataWarning,
  errorList: ReadonlyArray<EAdditionalValidationDataWarning> | undefined,
): boolean => {
  if (errorList) {
    return errorList.includes(error);
  }
  return false;
};

const getWithdrawFormSchema = (maxEther: string) =>
  YupTS.object({
    to: YupTS.string().enhance(v =>
      v.test(
        "isEthereumAddress",
        <FormattedMessage id="modals.tx-sender.withdraw-flow.withdraw-component.errors.not-ethereum-address" />,
        (value: string | undefined) => {
          // allow empty values as they should be handled by required yup validation
          if (value === undefined) {
            return true;
          }

          return validateAddress(value);
        },
      ),
    ),
    value: YupTS.number().enhance((v: NumberSchema) =>
      v
        .moreThan(0)
        .test(
          "isEnoughEther",
          <FormattedMessage id="modals.tx-sender.withdraw-flow.withdraw-component.errors.value-higher-than-balance" />,
          (value: string) => doesUserHaveEnoughEther(value, maxEther),
        ),
    ),
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
              value: additionalData.inputValue || "0",
              decimalPlaces: selectDecimalPlaces(ECurrency.ETH),
              inputFormat: ENumberInputFormat.ULPS,
            })
          : "",
        withdrawAll: false,
        allowNewAddress: false,
        allowSmartContract: false,
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
          <DataRow
            className={styles.noSpacing}
            caption={
              <FormLabel for="to" className={styles.label}>
                <FormattedMessage id="modal.sent-eth.to-address" />
              </FormLabel>
            }
            value={
              !errors.to &&
              values.to && (
                <EtherscanAddressLink className={cn(styles.etherscanLink)} address={values.to}>
                  <FormattedMessage id="modal.sent-eth.view-on-etherscan" />
                </EtherscanAddressLink>
              )
            }
          />

          <section>
            <FormInput
              name="to"
              data-test-id="modals.tx-sender.withdraw-flow.withdraw-component.to-address"
              maxLength={ETH_ADDRESS_SIZE}
              charactersLimit={ETH_ADDRESS_SIZE}
              icon={errors.to || !values.to ? undefined : txSuccess}
              theme={EInputTheme.BOX}
            />
          </section>

          {additionalData &&
            hasWarning(
              EAdditionalValidationDataWarning.IS_VERIFIED_PLATFORM_USER,
              additionalData.warnings,
            ) &&
            !errors.to && (
              <div
                data-test-id="modals.tx-sender.withdraw-flow.withdraw-component.verified-user"
                className={cn(styles.compensateSpacing, styles.verifiedUser)}
              >
                <FormattedMessage id="modal.sent-eth.verified-platform-user" />
              </div>
            )}

          {additionalData &&
            hasWarning(EAdditionalValidationDataWarning.IS_NEW_ADDRESS, additionalData.warnings) &&
            !errors.to && (
              <FormFieldBoolean
                className={styles.withTopSpacing}
                data-test-id="modals.tx-sender.withdraw-flow.withdraw-component.new-address"
                name="allowNewAddress"
                label={<FormattedMessage id="modal.sent-eth.new-address" />}
              />
            )}

          {additionalData &&
            hasWarning(
              EAdditionalValidationDataWarning.IS_NEW_ADDRESS_WITH_BALANCE,
              additionalData.warnings,
            ) &&
            !errors.to && (
              <FormFieldBoolean
                className={styles.withTopSpacing}
                data-test-id="modals.tx-sender.withdraw-flow.withdraw-component.new-address-with-balance"
                name="allowNewAddress"
                label={<FormattedMessage id="modal.sent-eth.new-address-with-balance" />}
              />
            )}

          {additionalData &&
            hasWarning(
              EAdditionalValidationDataWarning.IS_SMART_CONTRACT,
              additionalData.warnings,
            ) &&
            !errors.to && (
              <FormFieldBoolean
                className={styles.withTopSpacing}
                data-test-id="modals.tx-sender.withdraw-flow.withdraw-component.smart-contract"
                name="allowSmartContract"
                label={<FormattedMessage id="modal.sent-eth.smart-contract-address" />}
              />
            )}

          <DataRow
            className={cn(styles.noSpacing, styles.withTopSpacing)}
            caption={<FormattedMessage id="modal.sent-eth.available-balance" />}
            value={
              <MoneyNew
                data-test-id="modals.tx-sender.withdraw-flow.summary.balance"
                className={styles.money}
                value={ethAmount}
                inputFormat={ENumberInputFormat.ULPS}
                outputFormat={ENumberOutputFormat.ONLY_NONZERO_DECIMALS}
                valueType={ECurrency.ETH}
              />
            }
          />

          <section className={cn(styles.withSpacing, "text-right small")}>
            <Button
              data-test-id="modals.tx-sender.withdraw-flow.withdraw-component.whole-balance"
              disabled={!(additionalData && additionalData.maximumAvailableEther)}
              onClick={() => {
                // TODO: Remove disable button when issue with much bigger gas for random addresses has been fixed
                setFieldValue(
                  "value",
                  toFixedPrecision({
                    value:
                      additionalData && additionalData.maximumAvailableEther
                        ? additionalData.maximumAvailableEther
                        : "0",
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
              icon={ethIcon}
            />
          </section>

          <section
            className={cn(styles.withSpacing, "text-right", {
              [styles.compensateSpacing]: errors.value && values.value,
            })}
          >
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

          {additionalData &&
            hasWarning(
              EAdditionalValidationDataWarning.WILL_EMPTY_WALLET,
              additionalData.warnings,
            ) && (
              <FormFieldBoolean
                className={styles.withSpacing}
                data-test-id="modals.tx-sender.withdraw-flow.withdraw-component.will-empty-wallet"
                name="withdrawAll"
                label={
                  <FormattedMessage id="modals.tx-sender.withdraw-flow.withdraw-component.errors.value-will-empty-wallet" />
                }
              />
            )}

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
                icon={ethIcon}
              />
            }
          />

          <DataRowSeparator />

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
                data-test-id="modals.tx-sender.withdraw-flow.summary.total"
                theme={ETheme.BLACK}
                size={ESize.HUGE}
                textPosition={ETextPosition.RIGHT}
                outputFormat={ENumberOutputFormat.ONLY_NONZERO_DECIMALS_ROUND_UP}
                icon={ethIcon}
              />
            }
          />

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
                // TODO: Refactor to better readable form
                (additionalData &&
                  hasWarning(
                    EAdditionalValidationDataWarning.WILL_EMPTY_WALLET,
                    additionalData.warnings,
                  ) &&
                  !values.withdrawAll) ||
                (additionalData &&
                  hasWarning(
                    EAdditionalValidationDataWarning.IS_SMART_CONTRACT,
                    additionalData.warnings,
                  ) &&
                  !values.allowSmartContract) ||
                (additionalData &&
                  hasWarning(
                    EAdditionalValidationDataWarning.IS_NEW_ADDRESS,
                    additionalData.warnings,
                  ) &&
                  !values.allowNewAddress)
              }
              data-test-id="modals.tx-sender.withdraw-flow.withdraw-component.send-transaction-button"
            >
              {isValidating || (!validationState && additionalData) ? (
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
    onValidateHandler: ({ onValidate, maxEther }) => (values: IWithdrawData) => {
      const schema = getWithdrawFormSchema(maxEther);

      onValidate({
        to: values.to,
        value: values.value ? values.value : "0",
        type: ETxSenderType.WITHDRAW,
      });

      try {
        schema.validateSync(values, { abortEarly: false });
      } catch (errors) {
        return yupToFormErrors(errors);
      }

      return undefined;
    },
  }),
)(WithdrawLayout);

export { Withdraw, WithdrawLayout };
