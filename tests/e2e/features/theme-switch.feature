Feature: Theme Switch

  Background:
    Given I open website on desktop

  @light
  Scenario: Select light theme
    When I click on themes witch button
    And I select light theme
    Then The site is displayed in a light theme

  @dark
  Scenario: Select dark theme
    When I click on themes witch button
    And I select dark theme
    Then The site is displayed in a dark theme

  @system
  Scenario: Select system theme
    When I click on themes witch button
    And I select system theme
    Then The site is displayed in a system theme