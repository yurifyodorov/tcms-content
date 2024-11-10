// @ts-ignore
import onecolor from 'onecolor';
import { HomePage } from "@tests/pages/Home.page";
import { SignInPage } from "@tests/pages/SignIn.page";

Cypress.Commands.add("getElement", (selector: string) => {
  return cy.get(`[data-testid=${selector}]`)
})

Cypress.Commands.add('stepScreenshot', (screenshotName: string) => {
  cy.window().then((window) => {
    const width = window.innerWidth;
    const prefix = width === 375 ? 'mobile' : 'desktop';
    cy.screenshot(`${screenshotName}-${prefix}`);
  });
});

Cypress.Commands.add('verifyCSS', {
  prevSubject: 'element'
}, (subject: JQuery<HTMLElement>, property: CSSProperties, value: string) => {
  cy.wrap(subject).should(($el) => {
    const cssValue = $el.css(property as string);

    // Свойства, которые могут содержать цвет
    const colorProperties = [
      'color',
      'backgroundColor',
      'borderColor',
      'borderBlockColor',
      'borderBlockEndColor',
      'borderBlockStartColor',
      'borderBottomColor',
      'borderInlineColor',
      'borderInlineEndColor',
      'borderInlineStartColor',
      'borderLeftColor',
      'borderRightColor',
      'borderTopColor',
      'outlineColor',
      'textDecorationColor',
      'columnRuleColor',
      'caretColor',
      'boxShadow',
      'textShadow',
      'fill',
      'stroke',
      'floodColor',
      'lightingColor',
      'background',  // Может содержать background-color
      'border',      // Может содержать border-color
      'outline'      // Может содержать outline-color
    ];

    if (colorProperties.includes(property as string)) {
      // Для цветовых свойств используем onecolor для сравнения
      expect(onecolor(cssValue).hex()).to.equal(onecolor(value).hex());
    } else {
      // Для всех остальных свойств сравниваем напрямую
      expect(cssValue).to.equal(value);
    }
  });
});

Cypress.Commands.add('loginViaUI', (email: string) => {
  const homePage = new HomePage()
  const signinPage = new SignInPage()

  homePage.header.signInButton.click()
  signinPage.form.input.enterValue('email', email)
  signinPage.form.button.click('Войти через Email')
  signinPage.form.link.verify('Упрощённый тестовый вход')
  signinPage.form.link.click('Упрощённый тестовый вход')
})

Cypress.Commands.add('login', (userRole) => {
  cy.request('/api/auth/csrf').then(({ body: { csrfToken } }) => {
    cy.request({
      method: "POST",
      url: "/api/auth/signin/email",
      body: {
        email: userRole,
        callbackUrl: Cypress.config("baseUrl") ?? "http://localhost:3000",
        csrfToken,
        redirect: false,
      },
    });

    const callbackUrl = encodeURIComponent(Cypress.config('baseUrl') ?? 'http://localhost:3000');
    cy.visit(`/api/auth/callback/email?callbackUrl=${callbackUrl}&token=testtoken&email=${userRole}`);

    cy.get('[data-testid="profile-button"]').should('be.visible');
  });
});