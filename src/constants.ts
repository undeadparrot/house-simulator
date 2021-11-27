import { InteractionController } from "./InteractionController";
import * as THREE from "three";
import { Hud } from "./Hud";
import { HeightBrushTool } from "./tools/HeightBrushTool";
import { PieMenuManager } from "./pie-menu/PieMenuManager";
import { WorldGrid } from "./WorldGrid";
export const YPLUS = new THREE.Vector3(0, 1, 0);
export const XPLUS = new THREE.Vector3(1, 0, 0);
export const ZPLUS = new THREE.Vector3(0, 0, 1);

export const CLEAR_COLOR = new THREE.Color(0.9, 0.9, 0.9);
export const RED = new THREE.Color("red");
export const GREEN = new THREE.Color("green");
export const BLUE = new THREE.Color("blue");

export const TOOL_DONE = "TOOL_DONE";
export const TOOL_CLOSING = "TOOL_CLOSING";
export const TOOL_BUSY = "TOOL_BUSY";
export const TOOL_SKIP = "TOOL_SKIP";
export type ToolReturnCode =
  | typeof TOOL_DONE
  | typeof TOOL_CLOSING
  | typeof TOOL_BUSY
  | typeof TOOL_SKIP;

export interface GameToolUpdatePayload {
  readonly interactions: InteractionController;
  readonly hud: Hud;
  readonly piemans: PieMenuManager;
  readonly grid: WorldGrid;
  readonly terrainHit?: THREE.Intersection<THREE.Object3D<THREE.Event>>;
}
export interface PieMenuBootstrapPayload {
  setNextActiveTool(tool: GameTool): void;
  hud: Hud;
  cameraPan: THREE.Vector2;
  orthozoom: number;
  resizeWindow: Function;
  orthocam: THREE.OrthographicCamera;
}
export interface GameTool {
  getName(): string;
  update(
    shouldClose: boolean,
    delta: number,
    extra: GameToolUpdatePayload
  ): ToolReturnCode;
}
