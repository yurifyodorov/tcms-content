const SELECTORS = {
  PROFILE_MENU: "profile-menu",
  USERNAME: "username",
  MENU_ITEM: "menu-item"
};

export default class ProfileMenuComponent {
  verify(): void {
    cy.getElement(SELECTORS.PROFILE_MENU).within(() => {
      cy.getElement(SELECTORS.USERNAME)
      cy.getElement(SELECTORS.MENU_ITEM).contains('Профиль')
      cy.getElement(SELECTORS.MENU_ITEM).contains('Выход')
    }).should('be.visible');
  }

  click(menuItem: string): void {
    cy.getElement(SELECTORS.PROFILE_MENU).within(() => {
      cy.getElement(SELECTORS.MENU_ITEM).contains(menuItem).click()
    })
  }
}