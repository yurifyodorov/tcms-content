import { Then } from "@badeball/cypress-cucumber-preprocessor";
import { ADMIN, TESTER, GUEST } from "@tests/stabs/users";

Then('I have been authorized as admin', function () {
  cy.login(ADMIN.email)
})

Then('I have been authorized as tester', function () {
  cy.loginViaUI(TESTER.email)
})

Then('I have been authorized as guest', function () {
  cy.loginViaUI(GUEST.email)
})

Then('I see "GitHub" button', function () {
  cy.contains('GitHub').should('be.visible');
})

Then('I enter the user email: {word}', function (email: string) {
  // TODO: enter email
})

Then('I click on the log-in via email button', function () {
  // TODO: click on button 'Войти через Email'
})