@feature-tag-test
Feature: Auth

  Background:
    Given I open website on desktop

  @smoke
  Scenario Outline: Sign in with Email - "<userEmail>"
    When I am on the home page
    And I click on sign in button
    And I enter the user email: <userEmail>
    And I click on the log-in via email button
    Then I see username <userRole> in profile menu

    Examples:
      | userRole | userEmail           |
      | ADMIN    | admin@example.com   |
      | TESTER   | tester@example.com  |
      | GUEST    | guest@example.com   |

  Scenario: Sign in with GitHub
    When I am on the home page
    And I click on sign in button
    Then I see "GitHub" button