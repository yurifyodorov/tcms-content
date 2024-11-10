Feature: App Header

  Background:
    Given I open website on desktop
    And I am on the home page

  Scenario: Header logo
    When I see app header
    Then I see logo

  @skip
  Scenario: Main navigation
    When I see app header
    Then I see main navigation

  Scenario: Theme switch button
    When I see app header
    Then I see themes witch button

  Scenario: Sign-in button
    When I see app header
    Then I see signin button

  @skip
  Scenario: User avatar
    When I see app header
    Then I see user avatar

  @skip
  Scenario: User dropdown menu
    When I see app header
    And I click on avatar
    Then I see profile menu