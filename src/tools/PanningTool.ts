import { GameToolUpdatePayload, ToolReturnCode } from "./../constants";
import * as THREE from "three";
import { InteractionController } from "../InteractionController";
import { Hud } from "../Hud";
import { GameTool, TOOL_BUSY, TOOL_DONE } from "../constants";
export class PanningTool implements GameTool {
  private _start: THREE.Vector2;
  private _pan: THREE.Vector2;
  private _dirtyCallback: Function;
  private _firstUpdate: boolean;
  private _zoom: number;
  constructor(
    hud: Hud,
    p: THREE.Vector2,
    pan: THREE.Vector2,
    zoom: number,
    viewportWidth: number,
    worldWidth: number,
    dirtyCallback: Function
  ) {
    this._start = p.clone();
    this._pan = pan;
    this._zoom = zoom;
    this._dirtyCallback = dirtyCallback;
    this._firstUpdate = true;
    this._viewportWidth = viewportWidth;
    this._worldWidth = worldWidth;

    hud.logInfo(`PanningTool from ${p.x},${p.y}`);
  }
  getName = () => {
    return "Panning";
  };
  update = (
    shouldClose: boolean,
    _delta: number,
    { interactions , hud}: GameToolUpdatePayload
  ): ToolReturnCode => {
    if (shouldClose) {
      return TOOL_DONE;
    }
    if (this._firstUpdate) {
      this._firstUpdate = false;
      return TOOL_BUSY;
    }

    if (interactions.leftReleased === true) {
      const distance = interactions.mousePos.distanceTo(this._start);
      return TOOL_DONE;
    }
    hud.setCursor("grabbing");
    this._pan.add(
      new THREE.Vector2(
        (-(interactions.mouseDelta.x / this._viewportWidth) *
          this._worldWidth) /
          this._zoom,
        (-(interactions.mouseDelta.y / this._viewportWidth) *
          this._worldWidth) /
          this._zoom
      )
    );
    this._dirtyCallback();
    return TOOL_BUSY;
  };
}
