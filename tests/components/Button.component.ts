const SELECTORS = {
  BUTTON: "button",
};

export default class ButtonComponent {

  verifyButton(text: string): void {
    cy.getElement(SELECTORS.BUTTON).contains(text).should('be.visible');
  }

  click(text: string): void {
    cy.getElement(SELECTORS.BUTTON).contains(text).click();
  }
}