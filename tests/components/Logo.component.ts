const SELECTORS = {
  LOGO: "logo",
};

export default class LogoComponent {
  verifyLogo(): void {
    cy.getElement(SELECTORS.LOGO).should('be.visible');
  }
}