import InputComponent from "@tests/components/Input.component";
import TextareaComponent from "@tests/components/Textarea.component";
import ButtonComponent from "@tests/components/Button.component";
import LinkComponent from "@tests/components/Link.component";
import SwitchComponent from "@tests/components/Switch.component";

const SELECTORS = {
  FORM: "form",
  FORM_ITEM: "form-item",
  LABEL: "label",
  INPUT: "input",
  TEXTAREA: "textarea",
  SUBMIT_BUTTON: "submit",
  VALIDATION_MESSAGE: "validation-message"
};

export default class FormComponent {
  public input: InputComponent;
  public textarea: TextareaComponent;
  public button: ButtonComponent;
  public link: LinkComponent;
  public switch: SwitchComponent;

  constructor() {
    this.input = new InputComponent();
    this.textarea = new TextareaComponent();
    this.button = new ButtonComponent();
    this.link = new LinkComponent();
    this.switch = new SwitchComponent();
  }

  verifyForm(): void {
    cy.getElement(SELECTORS.FORM).within(() => {
      cy.getElement(SELECTORS.FORM_ITEM).each(($formItem: JQuery<HTMLElement>) => {
        const $label = $formItem.find(`[data-testid=${SELECTORS.LABEL}]`);

        if ($label.text().includes("Название")) {
          this.input.verifyPlaceholder("название...");
        }

        if ($label.text().includes("Описание")) {
          this.textarea.verifyPlaceholder("описание...");
        }
      });
    });
  }

  submit(): void {
    cy.getElement(SELECTORS.FORM).within(() => {
      cy.getElement(SELECTORS.SUBMIT_BUTTON)
        .should('be.visible')
        .and('not.be.disabled')
      cy.getElement(SELECTORS.SUBMIT_BUTTON).click()
    })
  }
}