type CSSProperties = keyof CSSStyleDeclaration;

declare namespace Cypress {
  interface Chainable {
    getElement(selector: string)
    stepScreenshot(screenshotName: string)
    verifyCSS(property: CSSProperties, value: string): Chainable<Element>;
    login(userRole: string): Chainable<void>;
    loginViaUI(userRole: string): Chainable<void>;
  }
}