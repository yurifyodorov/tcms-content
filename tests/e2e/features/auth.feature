Feature: Auth

  Authorization in different ways

  Background:
    Given I open website on desktop

  @smoke
  Scenario Outline: Sign in with Email - "<userEmail>"

    Login via email

    When I am on the home page
    And I click on sign in button
    And I enter the user email: <userEmail>
    And I click on the log-in via email button
    Then I see username <userRole> in profile menu

    Examples:
      | userRole | userEmail           |
      | MANAGER  | manager@example.com |
      | CLIENT   | client@example.com  |