import { Then } from '@badeball/cypress-cucumber-preprocessor';
import { HomePage } from "@tests/pages/Home.page";

const page = new HomePage()

Then('I see themes witch button', function () {
  page.header.themeToggle.verify()
})

Then('I click on themes witch button', function () {
  page.header.themeToggle.click()
})

Then('I select light theme', function () {
  page.header.themeToggle.selectLight()
})

Then('I select dark theme', function () {
  page.header.themeToggle.selectDark()
})

Then('I select system theme', function () {
  page.header.themeToggle.selectSystem()
})

Then('The site is displayed in a light theme', function () {
  page.header.themeToggle.checkTheme('light', '#ffffff')
  cy.stepScreenshot('theme-light');
})

Then('The site is displayed in a dark theme', function () {
  page.header.themeToggle.checkTheme('dark', '#020817')
  cy.stepScreenshot('theme-dark');
})

Then('The site is displayed in a system theme', function () {
  page.header.themeToggle.checkTheme('system', null);
  cy.stepScreenshot('theme-system');
});