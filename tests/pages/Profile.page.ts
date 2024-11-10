import FormComponent from "@tests/components/Form.component";
import HeaderComponent from "@tests/components/Header.component";
import AvatarComponent from "@tests/components/Avatar.component";

export class ProfilePage {
  public header: HeaderComponent
  public form: FormComponent;
  public avatar: AvatarComponent;

  public constructor() {
    this.header = new HeaderComponent();
    this.form = new FormComponent();
    this.avatar = new AvatarComponent();
  }
}