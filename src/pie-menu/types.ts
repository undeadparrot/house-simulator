import * as THREE from "three";

export type PieMenuZone =
  | {
      type: "direction";
      value: keyof typeof PIE_MENU_DIRECTIONS;
    }
  | {
      type: "range";
      from: number;
      to: number;
    };
export type PieMenuItem = {
  name: string;
  tickAngle?: number;
  zone: PieMenuZone;
  autoAccept: boolean;
  callback: (origin: THREE.Vector2, mouse: THREE.Vector2) => void;
  rangeCallback?: (angle: number) => void;
};

export const PIE_MENU_DIRECTIONS = {
  t: {
    name: "t",
    direction: new THREE.Vector2(0, -1),
  },
  b: {
    name: "b",
    direction: new THREE.Vector2(0, 1),
  },
  l: {
    name: "l",
    direction: new THREE.Vector2(-1, 0),
  },
  r: {
    name: "r",
    direction: new THREE.Vector2(1, 0),
  },
  tl: {
    name: "tl",
    direction: new THREE.Vector2(-1, -1),
  },
  tr: {
    name: "tr",
    direction: new THREE.Vector2(1, -1),
  },
  bl: {
    name: "bl",
    direction: new THREE.Vector2(-1, 1),
  },
  br: {
    direction: new THREE.Vector2(1, 1),
  },
};
export const PIE_MENU_DIRECTIONS_BY_V2 = {};
PIE_MENU_DIRECTIONS_BY_V2[
  [PIE_MENU_DIRECTIONS.t.direction.x, PIE_MENU_DIRECTIONS.t.direction.y]
] = PIE_MENU_DIRECTIONS.t;
PIE_MENU_DIRECTIONS_BY_V2[
  [PIE_MENU_DIRECTIONS.b.direction.x, PIE_MENU_DIRECTIONS.b.direction.y]
] = PIE_MENU_DIRECTIONS.b;
PIE_MENU_DIRECTIONS_BY_V2[
  [PIE_MENU_DIRECTIONS.l.direction.x, PIE_MENU_DIRECTIONS.l.direction.y]
] = PIE_MENU_DIRECTIONS.l;
PIE_MENU_DIRECTIONS_BY_V2[
  [PIE_MENU_DIRECTIONS.r.direction.x, PIE_MENU_DIRECTIONS.r.direction.y]
] = PIE_MENU_DIRECTIONS.r;
PIE_MENU_DIRECTIONS_BY_V2[
  [PIE_MENU_DIRECTIONS.tl.direction.x, PIE_MENU_DIRECTIONS.tl.direction.y]
] = PIE_MENU_DIRECTIONS.tl;
PIE_MENU_DIRECTIONS_BY_V2[
  [PIE_MENU_DIRECTIONS.tr.direction.x, PIE_MENU_DIRECTIONS.tr.direction.y]
] = PIE_MENU_DIRECTIONS.tr;
PIE_MENU_DIRECTIONS_BY_V2[
  [PIE_MENU_DIRECTIONS.bl.direction.x, PIE_MENU_DIRECTIONS.bl.direction.y]
] = PIE_MENU_DIRECTIONS.bl;
PIE_MENU_DIRECTIONS_BY_V2[
  [PIE_MENU_DIRECTIONS.br.direction.x, PIE_MENU_DIRECTIONS.br.direction.y]
] = PIE_MENU_DIRECTIONS.br;
