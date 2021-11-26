import * as THREE from "three";
import { InteractionController } from "../InteractionController";
import { Hud } from "../Hud";
import { GameTool, TOOL_BUSY, TOOL_DONE } from "../constants";
export class HeightBrushTool implements GameTool {
  private _pan: THREE.Vector2;
  private _dirtyCallback: Function;
  private _firstUpdate: boolean;
  private _offset: THREE.Vector2;
  private _zoom: number;
  constructor(hud: Hud) {
    this._firstUpdate = true;
  }
  getName = () => {
    return "Terraforming";
  };
  update = (
    closing: boolean,
    delta: number,
    interactions: InteractionController,
    hud: Hud
  ) => {
    if (closing) {
      return TOOL_DONE;
    }
    if (this._firstUpdate) {
      this._firstUpdate = false;
      return TOOL_BUSY;
    }

    if (interactions.rightDown === true) {
      hud.logInfo("dismiss terraforming brush");
      return TOOL_DONE;
    }
    if (interactions.leftDown) {
    }
    return TOOL_BUSY;
  };
}
