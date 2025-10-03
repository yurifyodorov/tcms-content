Feature: Update account

  Background:
    Given I open website on desktop
    And I click on profile link

  @regression
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

  @performance
  Scenario: Update email performance
    When I am on the profile page
    And I enter new email
    And I click on Save button
    Then The update should complete within 2 seconds

  @security
  Scenario: Prevent updating email with invalid token
    Given I am on the profile page with an expired session
    When I enter new email
    And I click on Save button
    Then I should see an authentication error
