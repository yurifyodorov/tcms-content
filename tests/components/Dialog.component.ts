import FormComponent from "@tests/components/Form.component";

const SELECTORS = {
  DIALOG_CONTENT: "dialog-content",
};

export default class DialogComponent {
  public form: FormComponent;

  constructor() {
    this.form = new FormComponent();
  }

  close(): void {
    cy.getElement(SELECTORS.DIALOG_CONTENT).should('be.visible');
    // TODO: click on close button
  }

  isDialogNotVisible(): void {
    cy.getElement(SELECTORS.DIALOG_CONTENT).should('not.exist');
  }
}