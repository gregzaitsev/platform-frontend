import { branch, compose, renderComponent, setDisplayName, withProps } from "recompose";

import { TEtoInvestmentCalculatedValues } from "../../../../../lib/api/eto/EtoApi.interfaces.unsafe";
import { IPledge } from "../../../../../lib/api/eto/EtoPledgeApi.interfaces.unsafe";
import { actions } from "../../../../../modules/actions";
import { selectIsInvestor, selectIsVerifiedInvestor } from "../../../../../modules/auth/selectors";
import {
  selectInvestorCount,
  selectMyPledge,
  selectPledgedAmount,
} from "../../../../../modules/bookbuilding-flow/selectors";
import {
  calculateWhitelistingState,
  EWhitelistingState,
} from "../../../../../modules/bookbuilding-flow/utils";
import { EETOStateOnChain } from "../../../../../modules/eto/types";
import { appConnect } from "../../../../../store";
import { onEnterAction } from "../../../../../utils/OnEnterAction";
import { LoadingIndicator } from "../../../../shared/loading-indicator/LoadingIndicator";

interface IExternalProps {
  etoId: string;
  investorsLimit: number;
  minPledge: number;
  investmentCalculatedValues?: TEtoInvestmentCalculatedValues;
  nextState: EETOStateOnChain;
  nextStateStartDate?: Date;
  whitelistingIsActive: boolean;
  keyQuoteFounder: string;
  canEnableBookbuilding: boolean;
}

interface IStateProps {
  pledgedAmount: number;
  investorsCount: number;
  isInvestor: boolean;
  pledge?: IPledge;
  isVerifiedInvestor: boolean;
}

interface IWithProps {
  whitelistingState: EWhitelistingState;
  countdownDate: Date | undefined;
}

type TComponentProps = {
  investorsLimit: number;
  pledgedAmount: number;
  investorsCount: number;
  isInvestor: boolean;
  etoId: string;
  minPledge: number;
  maxPledge?: number;
  nextState: EETOStateOnChain;
  countdownDate: Date | undefined;
  keyQuoteFounder: string;
  pledge?: IPledge;
  isVerifiedInvestor: boolean;
  whitelistingState: EWhitelistingState;
};

const connectCampaigningActivatedWidget = (
  WrappedComponent: React.FunctionComponent<TComponentProps>,
) =>
  compose<TComponentProps, IExternalProps>(
    appConnect<IStateProps, {}, IExternalProps>({
      stateToProps: (state, props) => ({
        isInvestor: selectIsInvestor(state),
        isVerifiedInvestor: selectIsVerifiedInvestor(state),
        pledgedAmount: selectPledgedAmount(state, props.etoId),
        investorsCount: selectInvestorCount(state, props.etoId),
        pledge: selectMyPledge(state, props.etoId),
      }),
    }),
    onEnterAction<IExternalProps & IStateProps>({
      actionCreator: (dispatch, props) => {
        dispatch(actions.bookBuilding.loadBookBuildingStats(props.etoId));

        if (props.isInvestor && props.isVerifiedInvestor) {
          dispatch(actions.bookBuilding.loadPledge(props.etoId));
        }
      },
    }),
    withProps<IWithProps, IStateProps & IExternalProps>(
      ({
        nextStateStartDate,
        whitelistingIsActive,
        canEnableBookbuilding,
        investorsLimit,
        investorsCount,
        investmentCalculatedValues,
      }) => {
        const bookbuildingLimitReached = investorsLimit - investorsCount === 0;
        return {
          whitelistingState: calculateWhitelistingState({
            canEnableBookbuilding,
            whitelistingIsActive,
            bookbuildingLimitReached,
            investorsCount,
          }),
          maxPledge: investmentCalculatedValues && investmentCalculatedValues.effectiveMaxTicket,
          countdownDate:
            !!nextStateStartDate && nextStateStartDate > new Date()
              ? nextStateStartDate
              : undefined,
        };
      },
    ),
    branch<IWithProps & IExternalProps>(
      ({ whitelistingState, investmentCalculatedValues }) =>
        whitelistingState === EWhitelistingState.ACTIVE && !investmentCalculatedValues,
      renderComponent(LoadingIndicator),
    ),
    setDisplayName("CampaigningActivatedWidget"),
  )(WrappedComponent);

export { connectCampaigningActivatedWidget, TComponentProps };
