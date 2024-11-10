import ReactFlowNodeComponent from "@tests/components/ReactFlowNode.component";
import DialogComponent from "@tests/components/Dialog.component";

export class MapPage {
  public reactFlowNode: ReactFlowNodeComponent;
  public dialog: DialogComponent;

  public constructor() {
    this.reactFlowNode = new ReactFlowNodeComponent();
    this.dialog = new DialogComponent();
  }
}