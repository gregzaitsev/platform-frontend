import { BigNumber } from "bignumber.js";
import * as React from "react";
import { FormattedMessage } from "react-intl-phraseapp";
import { Link } from "react-router-dom";
import { Col, Container, FormGroup, Label, Row } from "reactstrap";
import { compose, withProps } from "recompose";

import { actions } from "../../../../modules/actions";
import { selectEtoWithCompanyAndContractById } from "../../../../modules/eto/selectors";
import { TEtoWithCompanyAndContract } from "../../../../modules/eto/types";
import {
  EInvestmentErrorState,
  EInvestmentType,
} from "../../../../modules/investment-flow/reducer";
import {
  selectInvestmentErrorState,
  selectInvestmentEthValueUlps,
  selectInvestmentEtoId,
  selectInvestmentEurValueUlps,
  selectInvestmentType,
  selectIsInvestmentInputValidated,
  selectIsReadyToInvest,
} from "../../../../modules/investment-flow/selectors";
import {
  selectCalculatedEtoTicketSizesUlpsById,
  selectEquityTokenCountByEtoId,
  selectHasInvestorTicket,
  selectNeuRewardUlpsByEtoId,
} from "../../../../modules/investor-portfolio/selectors";
import {
  selectEtherPriceEur,
  selectEurPriceEther,
} from "../../../../modules/shared/tokenPrice/selectors";
import { selectTxGasCostEthUlps } from "../../../../modules/tx/sender/selectors";
import { ETokenType } from "../../../../modules/tx/types";
import { EValidationState } from "../../../../modules/tx/validator/reducer";
import { selectTxValidationState } from "../../../../modules/tx/validator/selectors";
import { appConnect } from "../../../../store";
import { addBigNumbers, multiplyBigNumbers } from "../../../../utils/BigNumberUtils";
import { IIntlProps, injectIntlHelpers } from "../../../../utils/injectIntlHelpers.unsafe";
import { appRoutes } from "../../../appRoutes";
import { InfoAlert } from "../../../shared/Alerts";
import { Button, EButtonLayout } from "../../../shared/buttons";
import { ButtonSize, ButtonTextPosition } from "../../../shared/buttons/Button";
import { Money } from "../../../shared/formatters/Money";
import {
  ECurrency,
  ENumberInputFormat,
  ENumberOutputFormat,
  ERoundingMode,
  formatNumber,
  formatThousands,
  selectDecimalPlaces,
} from "../../../shared/formatters/utils";
import { EHeadingSize, Heading } from "../../../shared/Heading";
import { MaskedNumberInput } from "../../../shared/MaskedNumberInput";
import { InvestmentTypeSelector, WalletSelectionData } from "./InvestmentTypeSelector";
import { createWallets, formatMinMaxTickets, getInputErrorMessage } from "./utils";

import * as styles from "./Investment.module.scss";

interface IStateProps {
  eto: TEtoWithCompanyAndContract;
  wallets: WalletSelectionData[];
  euroValue: string;
  ethValue: string;
  etherPriceEur: string;
  eurPriceEther: string;
  investmentType?: EInvestmentType;
  gasCostEth: string;
  errorState?: EInvestmentErrorState;
  txValidationState?: EValidationState;
  equityTokenCount?: string;
  neuReward?: string;
  readyToInvest: boolean;
  showTokens: boolean;
  hasPreviouslyInvested?: boolean;
  etoTicketSizes?: {
    minTicketEurUlps: BigNumber;
    maxTicketEurUlps: BigNumber;
  };
}

interface IDispatchProps {
  sendTransaction: () => void;
  changeEuroValue: (value: string) => void;
  changeEthValue: (value: string) => void;
  changeInvestmentType: (type: EInvestmentType) => void;
  investEntireBalance: () => void;
  startUpgradeFlow: (token: ETokenType) => void;
}

interface IWithProps {
  gasCostEuro: string;
  minTicketEth: string;
  minTicketEur: string;
  maxTicketEur: string;
}

type IProps = IStateProps & IDispatchProps & IIntlProps & IWithProps;

interface IState {
  validationError: boolean;
}

export class InvestmentSelectionComponent extends React.Component<IProps, IState> {
  state = { validationError: false };

  calculateTotalCostIfValid = (gasCost: string, value: string): string | null =>
    this.getError() ? null : addBigNumbers([gasCost, value || "0"]);

  setError = (hasError: boolean) => {
    this.setState({ validationError: hasError });
  };

  getError = () => {
    const externalError = getInputErrorMessage(
      this.props.errorState,
      this.props.txValidationState,
      this.props.eto.equityTokenName,
      this.props.maxTicketEur,
      this.props.minTicketEur,
    );
    const validationError = !this.state.validationError ? (
      undefined
    ) : (
      <FormattedMessage id="investment-flow.validation-error" />
    );

    return validationError || externalError;
  };

  investEntireBalance = () => {
    this.setError(false);
    this.props.investEntireBalance();
  };

  render(): React.ReactNode {
    const {
      changeInvestmentType,
      equityTokenCount,
      ethValue,
      eto,
      euroValue,
      gasCostEth,
      gasCostEuro,
      intl,
      investmentType,
      minTicketEth,
      minTicketEur,
      neuReward,
      readyToInvest,
      sendTransaction,
      showTokens,
      wallets,
      hasPreviouslyInvested,
      startUpgradeFlow,
    } = this.props;
    const error = this.getError();
    return (
      <>
        <Container className={styles.container} fluid>
          <Row className="mt-0">
            <Col>
              <Heading size={EHeadingSize.SMALL} level={4}>
                <FormattedMessage id="investment-flow.select-wallet-and-currency" />
              </Heading>
            </Col>
          </Row>
          <Row>
            <InvestmentTypeSelector
              wallets={wallets}
              currentType={investmentType}
              onSelect={changeInvestmentType}
              startUpgradeFlow={startUpgradeFlow}
            />
          </Row>
          <Row>
            <Col>
              <Heading size={EHeadingSize.SMALL} level={4}>
                <FormattedMessage id="investment-flow.calculate-investment" />
              </Heading>
            </Col>
          </Row>
          <Row>
            <Col>
              <p className={styles.amountToInvest}>
                <FormattedMessage id="investment-flow.amount-to-invest" />
              </p>
            </Col>
          </Row>
          <Row>
            <Col className="text-right">
              {(investmentType === EInvestmentType.NEur ||
                investmentType === EInvestmentType.ICBMnEuro) && (
                <MaskedNumberInput
                  name="euroValue"
                  value={this.props.euroValue}
                  storageFormat={ENumberInputFormat.ULPS}
                  valueType={ECurrency.EUR_TOKEN}
                  outputFormat={ENumberOutputFormat.FULL}
                  onChangeFn={this.props.changeEuroValue}
                  showUnits={true}
                  data-test-id="invest-modal-eur-field"
                  placeholder={`${intl.formatIntlMessage(
                    "investment-flow.min-ticket-size",
                  )} ${minTicketEur} EUR`}
                  errorMsg={error}
                  invalid={!!error}
                  setError={this.setError}
                />
              )}
              {(investmentType === EInvestmentType.ICBMEth ||
                investmentType === EInvestmentType.Eth) && (
                <MaskedNumberInput
                  name={"ethValue"}
                  valueType={ECurrency.ETH}
                  storageFormat={ENumberInputFormat.ULPS}
                  outputFormat={ENumberOutputFormat.FULL}
                  value={this.props.ethValue}
                  onChangeFn={this.props.changeEthValue}
                  placeholder={`${intl.formatIntlMessage(
                    "investment-flow.min-ticket-size",
                  )} ${formatNumber({
                    value: minTicketEth,
                    inputFormat: ENumberInputFormat.FLOAT,
                    outputFormat: ENumberOutputFormat.FULL,
                    decimalPlaces: selectDecimalPlaces(ECurrency.ETH, ENumberOutputFormat.FULL),
                  })} ETH`}
                  data-test-id="invest-modal-eth-field"
                  showUnits={true}
                  errorMsg={error}
                  invalid={!!error}
                  setError={this.setError}
                />
              )}
              <Button
                className={styles.investAll}
                data-test-id="invest-modal-full-balance-btn"
                onClick={this.investEntireBalance}
                layout={EButtonLayout.INLINE}
                textPosition={ButtonTextPosition.RIGHT}
                size={ButtonSize.SMALL}
              >
                <FormattedMessage id="investment-flow.invest-entire-balance" />
              </Button>
            </Col>
          </Row>
        </Container>
        <section className={styles.green}>
          <Container className={styles.container}>
            <Row>
              <Col>
                <p className="mb-0">
                  <FormattedMessage id="investment-flow.you-will-receive" />
                </p>
              </Col>
            </Row>
            <Row>
              <Col>
                <FormGroup>
                  <Label>
                    <FormattedMessage id="investment-flow.equity-tokens" />
                  </Label>
                  <InfoAlert>
                    {(showTokens &&
                      !error &&
                      equityTokenCount &&
                      `${formatThousands(equityTokenCount.toString())} ${eto.equityTokenSymbol}`) ||
                      "\xA0" /* non breaking space*/}
                  </InfoAlert>
                </FormGroup>
              </Col>
              <Col sm="1" />
              <Col>
                <FormGroup>
                  <Label>
                    <FormattedMessage id="investment-flow.estimated-neu-tokens" />
                  </Label>
                  <InfoAlert data-test-id="invest-modal.est-neu-tokens">
                    {(showTokens && !error && neuReward && (
                      <Money
                        value={neuReward}
                        inputFormat={ENumberInputFormat.ULPS}
                        valueType={ECurrency.NEU}
                        outputFormat={ENumberOutputFormat.ONLY_NONZERO_DECIMALS}
                      />
                    )) ||
                      "\xA0"}
                  </InfoAlert>
                </FormGroup>
              </Col>
            </Row>
            {hasPreviouslyInvested && (
              <Row>
                <Col>
                  <p className="mb-0 mt-0">
                    <FormattedMessage id="investment-flow.you-already-invested" />
                    <br />
                    <Link to={appRoutes.portfolio}>
                      <FormattedMessage id="investment-flow.see-your-portfolio-for-details" />
                    </Link>
                  </p>
                </Col>
              </Row>
            )}
          </Container>
        </section>
        <Container className={styles.container} fluid>
          <Row>
            <Col className={styles.summary}>
              {gasCostEth && !error && gasCostEth !== "0" && (
                <div>
                  + <FormattedMessage id="investment-flow.estimated-gas-cost" />:{" "}
                  <span className="text-warning" data-test-id="invest-modal-gas-cost">
                    {(investmentType === EInvestmentType.NEur ||
                      investmentType === EInvestmentType.ICBMnEuro) && (
                      <>
                        <Money
                          value={gasCostEth}
                          inputFormat={ENumberInputFormat.ULPS}
                          outputFormat={ENumberOutputFormat.FULL}
                          valueType={ECurrency.ETH}
                          roundingMode={ERoundingMode.UP}
                        />
                        {" ≈ "}
                        <Money
                          value={gasCostEuro}
                          inputFormat={ENumberInputFormat.ULPS}
                          outputFormat={ENumberOutputFormat.FULL}
                          valueType={ECurrency.EUR}
                          roundingMode={ERoundingMode.UP}
                        />
                      </>
                    )}
                    {(investmentType === EInvestmentType.ICBMEth ||
                      investmentType === EInvestmentType.Eth) && (
                      <Money
                        value={gasCostEth}
                        inputFormat={ENumberInputFormat.ULPS}
                        outputFormat={ENumberOutputFormat.FULL}
                        valueType={ECurrency.ETH}
                        roundingMode={ERoundingMode.UP}
                      />
                    )}
                  </span>
                </div>
              )}
              <div>
                <FormattedMessage id="investment-flow.total" />:{" "}
                <span className="text-warning" data-test-id="invest-modal-total-cost">
                  {(investmentType === EInvestmentType.NEur ||
                    investmentType === EInvestmentType.ICBMnEuro) && (
                    <Money
                      value={this.calculateTotalCostIfValid(gasCostEuro, euroValue)}
                      inputFormat={ENumberInputFormat.ULPS}
                      valueType={ECurrency.EUR}
                      outputFormat={ENumberOutputFormat.FULL}
                    />
                  )}
                  {(investmentType === EInvestmentType.ICBMEth ||
                    investmentType === EInvestmentType.Eth) && (
                    <Money
                      value={this.calculateTotalCostIfValid(gasCostEth, ethValue)}
                      inputFormat={ENumberInputFormat.ULPS}
                      outputFormat={ENumberOutputFormat.FULL}
                      valueType={ECurrency.ETH}
                    />
                  )}
                </span>
              </div>
            </Col>
          </Row>
        </Container>
        <Container>
          <Row className="justify-content-center mb-0">
            <Button
              onClick={sendTransaction}
              layout={EButtonLayout.PRIMARY}
              type="submit"
              disabled={!readyToInvest}
              data-test-id="invest-modal-invest-now-button"
            >
              <FormattedMessage id="investment-flow.invest-now" />
            </Button>
          </Row>
        </Container>
      </>
    );
  }
}

export const InvestmentSelection = compose<IProps, {}>(
  injectIntlHelpers,
  appConnect<IStateProps, IDispatchProps>({
    stateToProps: state => {
      const etoId = selectInvestmentEtoId(state);
      const eto = selectEtoWithCompanyAndContractById(state, etoId)!;
      const eur = selectInvestmentEurValueUlps(state);
      return {
        eto,
        etherPriceEur: selectEtherPriceEur(state),
        eurPriceEther: selectEurPriceEther(state),
        euroValue: eur,
        ethValue: selectInvestmentEthValueUlps(state),
        errorState: selectInvestmentErrorState(state),
        txValidationState: selectTxValidationState(state),
        gasCostEth: selectTxGasCostEthUlps(state),
        investmentType: selectInvestmentType(state),
        wallets: createWallets(state),
        neuReward: selectNeuRewardUlpsByEtoId(state, etoId),
        equityTokenCount: selectEquityTokenCountByEtoId(state, etoId),
        showTokens: !!(eur && selectIsInvestmentInputValidated(state)),
        readyToInvest: selectIsReadyToInvest(state),
        etoTicketSizes: selectCalculatedEtoTicketSizesUlpsById(state, etoId),
        hasPreviouslyInvested: selectHasInvestorTicket(state, etoId),
      };
    },
    dispatchToProps: dispatch => ({
      sendTransaction: () => dispatch(actions.txSender.txSenderAcceptDraft()),
      changeEthValue: value =>
        dispatch(actions.investmentFlow.submitCurrencyValue(value, ECurrency.ETH)),
      changeEuroValue: value =>
        dispatch(actions.investmentFlow.submitCurrencyValue(value, ECurrency.EUR_TOKEN)),
      changeInvestmentType: (type: EInvestmentType) =>
        dispatch(actions.investmentFlow.selectInvestmentType(type)),
      investEntireBalance: () => dispatch(actions.investmentFlow.investEntireBalance()),
      startUpgradeFlow: (token: ETokenType) => dispatch(actions.txTransactions.startUpgrade(token)),
    }),
  }),
  withProps<IWithProps, IStateProps>(
    ({ ethValue, etoTicketSizes, gasCostEth, etherPriceEur, eurPriceEther }) => {
      const gasCostEther = !ethValue ? "0" : gasCostEth;
      const gasCostEuro = multiplyBigNumbers([gasCostEther, etherPriceEur]);
      const minTicketEur =
        (etoTicketSizes &&
          etoTicketSizes.minTicketEurUlps &&
          formatMinMaxTickets(etoTicketSizes.minTicketEurUlps, ERoundingMode.UP)) ||
        "0";
      const maxTicketEur =
        (etoTicketSizes &&
          etoTicketSizes.maxTicketEurUlps &&
          formatMinMaxTickets(etoTicketSizes.maxTicketEurUlps, ERoundingMode.DOWN)) ||
        "0";

      return {
        minTicketEur,
        maxTicketEur,
        minTicketEth: multiplyBigNumbers([minTicketEur, eurPriceEther]),
        gasCostEuro,
        gasCostEth: gasCostEther,
      };
    },
  ),
)(InvestmentSelectionComponent);
