Feature: Update account

  Background:
    Given I open website on desktop
    And I click on profile link

  Scenario: Update email
    When I am on the profile page
    And I enter new email
    And I click on Save button
    Then I email succesfuly updated

  @skip
  Scenario: Update username
    When I am on the profile page
    And I enter new username
    And I click on Save button
    Then I username succesfuly updated