const SELECTORS = {
  LINK: "link",
};

export default class LinkComponent {
  verify(text: string): void {
    cy.getElement(SELECTORS.LINK).contains(text).should('be.visible');
  }

  click(text: string): void {
    cy.getElement(SELECTORS.LINK).contains(text).click();
  }
}