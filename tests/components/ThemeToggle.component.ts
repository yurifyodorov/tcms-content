const SELECTORS = {
  THEME_TOGGLE_BUTTON: "theme-toggle-button",
  DROPDOWN_MENU: "dropdown-menu",
  LIGHT: "light",
  DARK: "dark",
  SYSTEM: "system",
};

export default class ThemeToggleComponent {
  verify(): void {
    cy.getElement(SELECTORS.THEME_TOGGLE_BUTTON).should('be.visible');
  }

  click(): void {
    cy.getElement(SELECTORS.THEME_TOGGLE_BUTTON).click()
  }

  selectLight(): void {
    cy.getElement(SELECTORS.DROPDOWN_MENU).within(() => {
      cy.getElement(SELECTORS.LIGHT).click()
    })
  }

  selectDark(): void {
    cy.getElement(SELECTORS.DROPDOWN_MENU).within(() => {
      cy.getElement(SELECTORS.DARK).click()
    })
  }

  selectSystem(): void {
    cy.getElement(SELECTORS.DROPDOWN_MENU).within(() => {
      cy.getElement(SELECTORS.SYSTEM).click()
    })
  }

  checkTheme(expectedTheme: any, expectedColor: any) {
    cy.window().then((win) => {
      expect(win.localStorage.getItem('theme')).to.equal(expectedTheme);

      if (expectedTheme === "system") {
        const isDarkMode =
          win.matchMedia &&
          win.matchMedia("(prefers-color-scheme: dark)").matches;
        expectedColor = isDarkMode ? "#020817" : "#ffffff";
      }

      cy.get("body").verifyCSS("backgroundColor", expectedColor);
    });
  }
}