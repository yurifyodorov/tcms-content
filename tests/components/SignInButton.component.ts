const SELECTORS = {
  SIGNIN_BUTTON: "sign-in-button",
};

export default class SignInButtonComponent {
  verify(): void {
    cy.getElement(SELECTORS.SIGNIN_BUTTON).should('be.visible');
  }

  click(): void {
    cy.getElement(SELECTORS.SIGNIN_BUTTON).click()
  }
}