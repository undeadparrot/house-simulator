import { PanningTool } from "./PanningTool";
import { PieTool } from "./PieTool";
import {
  GameToolUpdatePayload,
  ToolReturnCode,
  TOOL_BUSY,
} from "./../constants";
import { InteractionController } from "../InteractionController";
import { Hud } from "../Hud";
import { GameTool, TOOL_DONE } from "../constants";
export class IdleTool implements GameTool {
  _setNextTool: (tool: GameTool) => void;
  _makeNewPanningTool: () => PanningTool;
  constructor(
    setNextTool: (tool: GameTool) => void,
    makeNewPanningTool: () => PanningTool
  ) {
    this._setNextTool = setNextTool;
    this._makeNewPanningTool = makeNewPanningTool;
  }
  getName = () => {
    return "Idle";
  };
  update = (
    _shouldClose: boolean,
    _delta: number,
    extras: GameToolUpdatePayload
  ): ToolReturnCode => {
    if (extras.interactions.rightPressed) {
      this._setNextTool(
        new PieTool(extras.hud, extras.interactions.mousePos, extras.piemans)
      );
      return TOOL_DONE;
    } else if (
      extras.interactions.leftPressed &&
      extras.interactions.shiftDown
    ) {
      this._setNextTool(this._makeNewPanningTool());
      return TOOL_DONE;
    }
    return TOOL_BUSY;
  };
}
