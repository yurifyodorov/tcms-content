# FIXME: эти сценарии должны запускаться посоле выполнения сценариев из update-node.feature
Feature: Delete node

  Background:
    Given I open website on desktop
    And I have been authorized as admin
    And I click on map link
    And I am on the map page

  @skip
  Scenario: Delete feature node
    When I click on feature node
    And I click on trash icon
    Then the feature node should not be displayed on the map

  @skip
  Scenario: Delete image node
    When I am on the map page
    When I click on image node
    And I click on trash icon
    Then the image node should not be displayed on the map