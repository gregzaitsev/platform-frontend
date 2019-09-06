import { appConnect } from "../store";
import { selectUiData } from "../modules/ui/selectors";
import { Landing } from "./landing/Landing";
import { WalletSelector } from "./wallet-selector/WalletSelector";
import { branch, compose, renderComponent } from "recompose";
import { EUiType } from "../modules/ui/sagas";
import { NeverComponent } from "../utils/NeverComponent";
import { renderComponentWithProps } from "../utils/renderComponentWithProps";

// export const AppRouter: React.FunctionComponent = () => (
//   <SwitchConnected>
//     {/* routes that are available for all users */}
//
//     <Route
//       path={appRoutes.etoPublicView}
//       render={({ match }) => (
//         <EtoPublicView
//           previewCode={match.params.previewCode}
//           jurisdiction={match.params.jurisdiction}
//         />
//       )}
//       exact
//     />
//     {/* Redirect Legacy ETO link to current link */}
//     <Route
//       path={appRoutes.etoPublicViewLegacyRoute}
//       render={({ match }) => <RedirectEtoPublicView previewCode={match.params.previewCode} />}
//       exact
//     />
//     <Route
//       path={appRoutes.etoPublicViewByIdLegacyRoute}
//       render={({ match }) => <RedirectEtoById etoId={match.params.etoId} />}
//       exact
//     />
//     <Route
//       path={appRoutes.etoPublicViewById}
//       render={({ match }) => (
//         <EtoPublicViewByContractId
//           etoId={match.params.etoId}
//           jurisdiction={match.params.jurisdiction}
//         />
//       )}
//       exact
//     />
//     <Route
//       path={appRoutes.etoWidgetView}
//       render={({ match }) => <EtoWidgetView previewCode={match.params.previewCode} />}
//       exact
//     />
//
//     <Route path={appRoutes.unsubscriptionSuccess} render={() => <UnsubscriptionSuccess />} exact />
//
//     <Route
//       path={appRoutes.unsubscription}
//       render={({ match }) => <Unsubscription email={match.params.email} />}
//       exact
//     />
//
//     {/* routes that are available for not logged in users */}
//
//     <OnlyPublicRoute path={appRoutes.root} component={Landing} exact />
//     <OnlyPublicRoute path={appRoutes.register} component={WalletSelector} />
//     <OnlyPublicRoute path={appRoutes.login} component={WalletSelector} />
//     <OnlyPublicRoute path={appRoutes.restore} component={WalletRecoverMain} />
//     {process.env.NF_ISSUERS_ENABLED === "1" && [
//       <OnlyPublicRoute
//         key={appRoutes.etoLanding}
//         path={appRoutes.etoLanding}
//         component={LandingEto}
//       />,
//       <OnlyPublicRoute
//         key={appRoutes.registerIssuer}
//         path={appRoutes.registerIssuer}
//         component={EtoSecretProtectedWalletSelector}
//       />,
//       <OnlyPublicRoute
//         key={appRoutes.loginIssuer}
//         path={appRoutes.loginIssuer}
//         component={() => <Redirect to={appRoutes.login} />}
//       />,
//       <OnlyPublicRoute
//         key={appRoutes.restoreIssuer}
//         path={appRoutes.restoreIssuer}
//         component={() => <Redirect to={appRoutes.restore} />}
//       />,
//     ]}
//     {process.env.NF_NOMINEE_ENABLED === "1" && [
//       <OnlyPublicRoute
//         key={appRoutes.registerNominee}
//         path={appRoutes.registerNominee}
//         component={WalletSelector}
//       />,
//       <OnlyPublicRoute
//         key={appRoutes.loginNominee}
//         path={appRoutes.loginNominee}
//         component={() => <Redirect to={appRoutes.login} />}
//       />,
//       <OnlyPublicRoute
//         key={appRoutes.restoreNominee}
//         path={appRoutes.restoreNominee}
//         component={() => <Redirect to={appRoutes.restore} />}
//       />,
//     ]}
//
//     {/* only investors routes */}
//     {process.env.NF_PORTFOLIO_PAGE_VISIBLE === "1" && (
//       <OnlyAuthorizedRoute path={appRoutes.portfolio} investorComponent={Portfolio} />
//     )}
//     <OnlyAuthorizedRoute path={appRoutes.icbmMigration} investorComponent={MigrationFromLink} />
//     <OnlyAuthorizedRoute
//       path={appRoutes.walletUnlock}
//       investorComponent={UnlockWalletFundsFromLink}
//     />
//
//     {/* only issuer routes */}
//     <OnlyAuthorizedRoute path={appRoutes.etoRegister} issuerComponent={EtoRegister} />
//
//     {/* issuer AND nominee routes */}
//     <OnlyAuthorizedRoute
//       path={appRoutes.documents}
//       issuerComponent={Documents}
//       nomineeComponent={Documents}
//       exact
//     />
//     <OnlyAuthorizedRoute
//       path={appRoutes.etoIssuerView}
//       issuerComponent={EtoIssuerView}
//       nomineeComponent={EtoNomineeView}
//       exact
//     />
//
//     {/* common routes for both investors and issuers */}
//     <OnlyAuthorizedRoute
//       path={appRoutes.wallet}
//       investorComponent={Wallet}
//       issuerComponent={Wallet}
//       nomineeComponent={Wallet}
//     />
//     <OnlyAuthorizedRoute
//       path={appRoutes.dashboard}
//       investorComponent={Dashboard}
//       issuerComponent={EtoDashboard}
//       nomineeComponent={NomineeDashboard}
//       exact
//     />
//     <OnlyAuthorizedRoute
//       path={appRoutes.verify}
//       investorComponent={EmailVerify}
//       issuerComponent={EmailVerify}
//       nomineeComponent={EmailVerify}
//     />
//     <OnlyAuthorizedRoute
//       path={appRoutes.profile}
//       investorComponent={Settings}
//       issuerComponent={Settings}
//       nomineeComponent={Settings}
//       exact
//     />
//     <OnlyAuthorizedRoute
//       path={profileRoutes.seedBackup}
//       investorComponent={BackupSeed}
//       issuerComponent={BackupSeed}
//       nomineeComponent={BackupSeed}
//       exact
//     />
//     <OnlyAuthorizedRoute
//       path={appRoutes.kyc}
//       investorComponent={Kyc}
//       issuerComponent={Kyc}
//       nomineeComponent={Kyc}
//     />
//
//     {/*Routes used only in E2E tests*/}
//     {process.env.NF_CYPRESS_RUN === "1" && [
//       <Route
//         key={1}
//         path={e2eRoutes.embeddedWidget}
//         render={({ match }) => <EmbeddedWidget previewCode={match.params.previewCode} />}
//         exact
//       />,
//       <Route key={2} path={e2eRoutes.criticalError} render={() => <TestCriticalError />} exact />,
//     ]}
//     <Redirect to={appRoutes.root} />
//   </SwitchConnected>
// );

export const AppRouter = compose(
  appConnect<any, any, any>({
    stateToProps: (state, { dataKey }) => {console.log("AppRouter",dataKey);return selectUiData(state, dataKey)},
  }),
  branch<any>(({state}) => state === EUiType.WALLET_SELECTOR, renderComponentWithProps({dataKey:EUiType.WALLET_SELECTOR},WalletSelector)),
  branch<any>(({state}) => state === EUiType.LANDING, renderComponentWithProps({dataKey: EUiType.LANDING},Landing)),
)(NeverComponent("router"));
