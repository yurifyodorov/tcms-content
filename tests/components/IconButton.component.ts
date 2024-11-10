const SELECTORS = {
  EYE_ICON: "eye-icon",
  SETTINGS_ICON: "settings-icon",
  TRASH_ICON: "trash-icon",
};

export default class IconButton {
  click(selector: string): void {
    switch (selector) {
      case SELECTORS.EYE_ICON:
        cy.getElement(SELECTORS.EYE_ICON).click();
        break;
      case SELECTORS.SETTINGS_ICON:
        cy.getElement(SELECTORS.SETTINGS_ICON).click();
        break;
      case SELECTORS.TRASH_ICON:
        cy.getElement(SELECTORS.TRASH_ICON).click();
        break;
      default:
        throw new Error(`Unknown selector: ${selector}`);
    }
  }
}