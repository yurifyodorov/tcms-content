Feature: Theme Switch

  Background:
    Given I open website on desktop

  Scenario: Select light theme
    When I click on themes witch button
    And I select light theme
    Then The site is displayed in a light theme

  Scenario: Select dark theme
    When I click on themes witch button
    And I select dark theme
    Then The site is displayed in a dark theme

  Scenario: Select system theme
    When I click on themes witch button
    And I select system theme
    Then The site is displayed in a system theme
