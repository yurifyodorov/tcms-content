Feature: Update node

  Background:
    Given I open website on desktop
    And I have been authorized as admin
    And I click on map link
    And I am on the map page

  @skip
  Scenario: Hide node
    When I click on feature node
     And I click on setting icon
     And I click on hide toggle
     And I click on update button
     Then The node update dialog should be closed
     Then the node become a hidden

  @skip
  Scenario: Change X position
    And I click on feature node
    And I click on setting icon
    And I am enter a new X position
    And I click on update button
    Then The node update dialog should be closed
    And the node X position should be updated

  @skip
  Scenario: Change X position with the mouse
    # TODO: переместить ноду горизонтально с помощью мыши

  @skip
  Scenario: Change Y position
    When I click on feature node
    And I click on setting icon
    And I am enter a new Y position
    And I click on update button
    Then The node update dialog should be closed
    And the node Y position should be updated

  @skip
  Scenario: Change Y position with the mouse
    # TODO: переместить ноду вертикально с помощью мыши

  @skip
  Scenario: Change Z-index
    When I click on feature node
    And I click on setting icon
    And I am enter a new z-index value
    And I click on update button
    Then The node update dialog should be closed
    Then the node z-index should be updated

  @skip
  Scenario: Change node width
    When I click on feature node
    And I click on setting icon
    And I am enter a new width value
    And I click on update button
    Then The node update dialog should be closed
    Then the node width should be updated

  @skip
  Scenario: Change node height
    When I click on feature node
    And I click on setting icon
    And I am enter a new height value
    And I click on update button
    Then The node update dialog should be closed
    Then the node height should be updated

  @skip
  Scenario: Change node scale
    When I click on feature node
    And I click on setting icon
    And I am enter a new scale value
    And I click on update button
    Then The node update dialog should be closed
    Then the node scale should be updated

  @skip
  Scenario: Change node rotation
    When I click on feature node
    And I click on setting icon
    And I am enter a new rotation value
    And I click on update button
    Then The node update dialog should be closed
    Then the node rotation should be updated