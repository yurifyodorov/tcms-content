import { Then } from "@badeball/cypress-cucumber-preprocessor";
import { MANAGER, CLIENT } from "@tests/stabs/users";

Then('I have been authorized as manager', function () {
  cy.login(MANAGER.email)
})

Then('I have been authorized as client', function () {
  cy.loginViaUI(CLIENT.email)
})

Then('I enter the user email: {word}', function (email: string) {
  // TODO: enter email
})

Then('I click on the log-in via email button', function () {
  // TODO: click on button 'Войти через Email'
})