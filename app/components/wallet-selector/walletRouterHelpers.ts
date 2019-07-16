import { appRoutes } from "../appRoutes";

export function getRedirectionUrl(rootPath: string): string {
  const { loginEto, registerIssuer, registerNominee } = appRoutes;

  switch (rootPath) {
    case loginEto:
    case registerIssuer:
      return `${rootPath}/ledger`;
    case registerNominee:
      return `${rootPath}/light`;
    default:
      return `${rootPath}/light`;
  }
}
