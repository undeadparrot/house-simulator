import * as THREE from "three";
import { InteractionController } from "../InteractionController";
import { Hud } from "../Hud";
import { GameTool, TOOL_BUSY, TOOL_DONE } from "../constants";
export class AutoPanningTool implements GameTool {
  private _start: THREE.Vector2;
  private _pan: THREE.Vector2;
  private _dirtyCallback: Function;
  private _firstUpdate: boolean;
  private _offset: THREE.Vector2;
  private _zoom: number;
  constructor(hud: Hud, p: THREE.Vector2, pan: THREE.Vector2, zoom: number, dirtyCallback: Function) {
    this._start = p.clone();
    this._pan = pan;
    this._dirtyCallback = dirtyCallback;
    this._firstUpdate = true;
    this._offset = new THREE.Vector2();
    this._zoom = zoom;
    
    hud.logInfo(`PanningTool from ${p.x},${p.y}`);
  }
  getName = () => {
    return "Panning";
  };
  update = (closing: boolean, delta: number, interactions: InteractionController, hud: Hud) => {
    
    if(closing){
      
      return TOOL_DONE;
    }
    if(this._firstUpdate){
      
      this._firstUpdate = false;
      return TOOL_BUSY;
    }
    
    if (interactions.leftPressed === true) {
      return TOOL_DONE;
    }
    this._offset.copy(this._start).sub(interactions.mousePos);
    this._pan.add(
      new THREE.Vector2(
        -(this._offset.x *(0.05/this._zoom))* delta,
        -(this._offset.y *(0.05/this._zoom))* delta
      )
    );
    hud.showNow(`pan: ${this._offset.x.toFixed(0)},${this._offset.y.toFixed(0)}`)
    this._dirtyCallback();
    return TOOL_BUSY;
  };
}
