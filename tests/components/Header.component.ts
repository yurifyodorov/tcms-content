import ThemeToggleComponent from "@tests/components/ThemeToggle.component";
import LogoComponent from "@tests/components/Logo.component";
import MainNavigationComponent from "@tests/components/MainNavigation.component";
import ProfileMenuComponent from "@tests/components/ProfileMenu.component";
import AvatarComponent from "@tests/components/Avatar.component";
import SignInButtonComponent from "@tests/components/SignInButton.component";

const SELECTORS = {
  APP_HEADER: "app-header",
};

export default class HeaderComponent {
  public logo: LogoComponent;
  public mainNavigation: MainNavigationComponent;
  public themeToggle: ThemeToggleComponent;
  public signInButton: SignInButtonComponent;
  public avatar: AvatarComponent;
  public profileMenu: ProfileMenuComponent;

  constructor() {
    this.logo = new LogoComponent();
    this.mainNavigation = new MainNavigationComponent();
    this.themeToggle = new ThemeToggleComponent();
    this.signInButton = new SignInButtonComponent();
    this.avatar = new AvatarComponent();
    this.profileMenu = new ProfileMenuComponent();
  }

  verifyHeader(): void {
    cy.getElement(SELECTORS.APP_HEADER).should('be.visible');
  }
}