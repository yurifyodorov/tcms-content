import HeaderComponent from "@tests/components/Header.component";

export class HomePage {
  public header: HeaderComponent

  public constructor() {
    this.header = new HeaderComponent();
  }
}