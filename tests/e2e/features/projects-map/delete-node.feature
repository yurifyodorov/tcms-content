# FIXME: эти сценарии должны запускаться посоле выполнения сценариев из update-node.feature
Feature: Delete node

  Background:
    Given I open website on desktop
    And I have been authorized as admin
    And I click on map link
    And I am on the map page

  Scenario: Delete project node
    When I click on project node
    And I click on trash icon
    Then the project node should not be displayed on the map

  Scenario: Delete image node
    When I am on the map page
    When I click on image node
    And I click on trash icon
    Then the image node should not be displayed on the map