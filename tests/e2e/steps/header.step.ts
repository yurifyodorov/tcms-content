import { Then } from "@badeball/cypress-cucumber-preprocessor";
import { HomePage } from "@tests/pages/Home.page";

const page = new HomePage()

Then('I see app header', function () {
  page.header.verifyHeader()
})

Then('I see logo', function () {
  page.header.logo.verifyLogo()
})

Then('I see main navigation', function () {
  page.header.mainNavigation.verifyNavigation()
})

Then('I see signin button', function () {
  page.header.signInButton.verify()
})

Then('I click on sign in button', function () {
  page.header.signInButton.click()
})

Then('I see user avatar', function () {
  page.header.avatar.verify()
})

Then('I click on avatar', function () {
  page.header.avatar.click()
})

Then('I see profile menu', function () {
  page.header.profileMenu.verify()
})

Then('I click on profile link', function () {
  page.header.profileMenu.click('Profile')
})

Then('I see username {word} in profile menu', function (username: string) {
  cy.log('username:', username)
  // TODO: check username
})