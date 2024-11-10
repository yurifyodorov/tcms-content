import { Then } from "@badeball/cypress-cucumber-preprocessor";
import { ProfilePage } from "@tests/pages/Profile.page";

const page = new ProfilePage();

Then('I see app header on profile page', function () {
  page.header.verifyHeader()
})

Then('I upload new image in avatar field', function () {
  page.avatar.uploadAvatar()
})