import ReactFlowToolbar from "@tests/components/ReactFlowToolbar.component";

const SELECTORS = {
  RF_NODE: "rf__node",
  NODE_CARD: "node-card"
};

export default class ReactFlowNodeComponent {
  public toolbar: ReactFlowToolbar;

  constructor() {
    this.toolbar = new ReactFlowToolbar();
  }

  click(selector: string): void {
    cy.getElement(`${SELECTORS.RF_NODE}-${selector}`).click()
  }

  getNode(selector: string): Cypress.Chainable<JQuery<HTMLElement>> {
    return cy.getElement(`${SELECTORS.RF_NODE}-${selector}`)
  }

  getNodeCard(selector: string): Cypress.Chainable<JQuery<HTMLElement>> {
    return cy.getElement(`${SELECTORS.RF_NODE}-${selector}`).then(($node: JQuery<HTMLElement>) => {
      return cy.wrap($node).find(`[data-testid=${SELECTORS.NODE_CARD}]`);
    });
  }
}