import { getRandomNumber } from '../support/utils';

const SELECTORS = {
  INPUT: "input",
  LABEL: "label",
};

export default class InputComponent {
  verifyPlaceholder(text: string): void {
    cy.getElement(SELECTORS.INPUT).should('have.attr', 'placeholder', text);
  }

  verifyAriaLabel(name: string, ariaLabelText: string): void {
    cy.getElement(SELECTORS.INPUT)
      .filter(`[name="${name}"]`)
      .should('have.attr', 'aria-label', ariaLabelText);
  }

  enterValue(name: string, value: string | number): void {
    cy.getElement(SELECTORS.INPUT)
      .filter(`[name="${name}"]`)
      .clear()
      .type(value);
  }

  enterRandomNumber(name: string, min: number, max: number): number {
    const randomValue = getRandomNumber(min, max);
    cy.getElement(SELECTORS.INPUT)
      .filter(`[name="${name}"]`)
      .clear()
      .type(randomValue.toString());

    return randomValue;
  }
}