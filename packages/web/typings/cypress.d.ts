declare namespace Cypress {
  // noinspection TsLint
  interface Chainable<Subject = any> {
    dropFile: (fixture: string) => void;
    awaitedClick: (waitDuration?: number) => Cypress.Chainable;
    iframe: (selector: string) => Cypress.Chainable<JQuery<HTMLBodyElement>>;
    saveLocalStorage: () => Cypress.Chainable;
    restoreLocalStorage: () => Cypress.Chainable;
  }
}
