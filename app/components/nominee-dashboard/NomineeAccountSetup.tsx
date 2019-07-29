import { branch, compose, renderComponent, renderNothing, withProps } from "recompose";

import { INomineeAccountSetupSteps, AccountSetupLayout } from "./AccountSetupFlow";
import { prepareSetupAccountSteps } from "./utils";
import { appConnect } from "../../store";
import { selectNomineeKycRequestStatus } from "../../modules/kyc/selectors";
import { selectBackupCodesVerified, selectIsUserEmailVerified } from "../../modules/auth/selectors";
import { EKycRequestStatus } from "../../lib/api/KycApi.interfaces";
import { NomineeKycPending } from "./NomineeKycPending";
import { nomineeAccountSetupSteps } from "./AccountSetupData";

interface IStateProps {
  emailVerified: boolean;
  backupCodesVerified: boolean;
  kycRequestStatus: EKycRequestStatus;
}

export const NomineeAccountSetup = compose<INomineeAccountSetupSteps, {}>(
  appConnect<IStateProps | null>({
    stateToProps: state => {
      const kycRequestStatus = selectNomineeKycRequestStatus(state);
      if (kycRequestStatus !== undefined) {
        return ({
          emailVerified: selectIsUserEmailVerified(state.auth),
          backupCodesVerified: selectBackupCodesVerified(state),
          kycRequestStatus,
        })
      } else {
        return null
      }
    }
  }),
  branch<IStateProps | null>(props => props === null, renderNothing),
  branch<IStateProps>(
    props =>
      props.emailVerified &&
      props.backupCodesVerified &&
      [EKycRequestStatus.PENDING, EKycRequestStatus.IGNORED, EKycRequestStatus.REJECTED].includes(props.kycRequestStatus),
    renderComponent(
      withProps<{ kycRequestStatus: EKycRequestStatus }, IStateProps>(({ kycRequestStatus }) =>
        ({ kycRequestStatus }))(NomineeKycPending)),
  ),
  withProps<INomineeAccountSetupSteps, IStateProps>(
    ({ emailVerified, backupCodesVerified, kycRequestStatus }: IStateProps) => ({
      accountSetupStepsData: prepareSetupAccountSteps(
        nomineeAccountSetupSteps(
          emailVerified,
          backupCodesVerified,
          kycRequestStatus !== EKycRequestStatus.DRAFT,
        ),
      ),
    }),
  ),
)(AccountSetupLayout);
