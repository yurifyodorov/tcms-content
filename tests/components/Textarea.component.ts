const SELECTORS = {
  TEXTAREA: "textarea",
};

export default class TextareaComponent {
  verifyPlaceholder(text: string): void {
    cy.getElement(SELECTORS.TEXTAREA).should('have.attr', 'placeholder', text);
  }

  //  TODO: verify aria label

  typeText(text: string): void {
    cy.getElement(SELECTORS.TEXTAREA).clear().type(text);
  }
}