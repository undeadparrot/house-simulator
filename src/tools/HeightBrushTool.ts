import { GameToolUpdatePayload, ToolReturnCode, TOOL_SKIP } from "./../constants";
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
    shouldClose: boolean,
    _delta: number,
    { interactions, hud }: GameToolUpdatePayload
  ): ToolReturnCode => {
    if (shouldClose) {
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
    if (interactions.leftDown && !interactions.shiftDown) {
      return TOOL_BUSY;
    }
    return TOOL_SKIP;
  };


  private brushTerrain(
    hit: THREE.Intersection<THREE.Object3D<THREE.Event>>
  ) {
    if (hit !== undefined) {
      const hitTileX = Math.floor(hit.point.x);
      const hitTileZ = Math.floor(hit.point.z);
      const hitTileHeight = this.grid.get(hitTileX, hitTileZ) || 0;
      this.grid.brush(new THREE.Vector2(hitTileX, hitTileZ), 3, 0.05);

      const hitTileBlPoint = new THREE.Vector3(
        hitTileX,
        hitTileHeight,
        hitTileZ
      );
      const hitTileTrPoint = hitTileBlPoint
        .clone()
        .add(new THREE.Vector3(1, 0.1, 1));

      this.hitarrow.position.copy(hit.point);
      this.hitcage.box.setFromPoints([hitTileBlPoint, hitTileTrPoint]);
      if (hit.face) {
        const p0 = hit.point;
        this.hud.showNow(
          `${p0.x.toFixed(2)} ${p0.y.toFixed(2)} ${p0.z.toFixed(2)}`
        );
        this.hud.showNow(`faceindex: ${hit.faceIndex}`);
      }
    }
  }
}
