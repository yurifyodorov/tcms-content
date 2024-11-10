const SELECTORS = {
  SWITCH: "switch",
};

export default class SwitchComponent {
  click(): void {
    cy.getElement(SELECTORS.SWITCH).click();
  }
}