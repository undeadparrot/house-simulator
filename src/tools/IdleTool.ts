import { InteractionController } from "../InteractionController";
import { Hud } from "../Hud";
import { GameTool, TOOL_DONE } from "../constants";
export class IdleTool implements GameTool {
  constructor() {}
  getName = () => {
    return "Idle";
  };
  update = (
    closing: boolean,
    delta: number,
    interactions: InteractionController,
    hud: Hud
  ) => {
    return TOOL_DONE;
  };
}
