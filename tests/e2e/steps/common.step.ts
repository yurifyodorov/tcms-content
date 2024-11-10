import { Before, Given } from "@badeball/cypress-cucumber-preprocessor";
import { saveBrowserDetails } from "@tests/support/utils";

Before(() => {
  saveBrowserDetails();
})

Given('I open website on desktop', function () {
  const deviceName = 'macbook-16';
  cy.viewport(deviceName);
  cy.visit('/');
})

Given('I am on the home page', function () {
  cy.url().should('eq', Cypress.config('baseUrl'));
})

Given('I am on the map page', function () {
  cy.url().should('eq', Cypress.config('baseUrl') + 'map');
})