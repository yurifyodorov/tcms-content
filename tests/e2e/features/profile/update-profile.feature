Feature: Update Profile

  Background:
    Given I open website on desktop
     And I have been authorized as admin

  @skip
  Scenario: App header on profile page
    When I am on the home page
    # And I click on avatar
    # And I click on profile link
    # Then I see app header on profile page

  @skip
  Scenario Outline: Update username - "<username>"
    When I am on the home page
    And I click on avatar
    And I click on profile link
    # And The system redirects me to my profile page ('profile/${ADMIN.id}')
    # And I see my current username
    # And I am entering a new value in the username field
    # And I click the Save button
    # TODO: update username and verify new username in field and profileMenu
    # Then I see a Toast about a successful profile update
    # And I see a new username in the username field
    # And I click on avatar
    # Then I see a new username in the profile menu

    Examples:
      | userRole | username   |
      | ADMIN    | AdminNew   |
      | TESTER   | TesterNew  |
      | GUEST    | GuestNew   |

  @skip
  Scenario Outline: Update avatar - "<avatar>"
    When I am on the home page
    And I click on avatar
    And I click on profile link
    # And The system redirects me to my profile page ('profile/${ADMIN.id}')
    # And I see alphabetic characters in the avatar field
    # And I click on the avatar upload field
    # And I click the Save button
    # TODO: update avatar and verify new avatar in AvatarField and profileMenu

    Examples:
      | userRole | avatar      |
      | ADMIN    | admin.png   |
      | TESTER   | tester.png  |
      | GUEST    | guest.png   |

  @skip
  Scenario: Update avatar image path
    When I am on the home page
    And I click on avatar
    And I click on profile link
    And I upload new image in avatar field
    # TODO: verify 'src' in <img> and check 'src' in avatar in header

  @skip
  Scenario: Admin can update other users
    # TODO: add steps later

  @skip
  Scenario: Tester cannot update other users
    # TODO: add steps later

  @skip
  Scenario: Guest cannot update other users
    # TODO: add steps later
