const SELECTORS = {
  MAIN_NAVIGATION: "main-navigation",
  LINK: "link",
};

export default class MainNavigationComponent {
  verifyNavigation(): void {
    cy.getElement(SELECTORS.MAIN_NAVIGATION).within(() => {
      // TODO: check navigation links later
    }).should('be.visible');
  }

  click(menuItem: string): void {
    cy.getElement(SELECTORS.MAIN_NAVIGATION).within(() => {
      cy.getElement(SELECTORS.LINK).contains(menuItem).click()
    })
  }
}