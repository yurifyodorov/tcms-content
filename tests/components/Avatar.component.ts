const SELECTORS = {
  AVATAR: "avatar",
};

export default class AvatarComponent {
  verify(): void {
    cy.getElement(SELECTORS.AVATAR).should('be.visible');
  }

  click(): void {
    cy.getElement(SELECTORS.AVATAR).click()
  }

  uploadAvatar(): void {
    // TODO: implement function for uploading file
  }
}