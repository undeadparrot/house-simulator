import * as THREE from "three";
import { PIE_MENU_DIRECTIONS, PIE_MENU_DIRECTIONS_BY_V2 } from "./types";
import { PieMenuItem } from "./types";

export class PieMenu {
  isOpen: boolean;
  center: THREE.Vector2;
  radius: number;
  autoAcceptRadius: number;
  drawRadius: number;
  direction: THREE.Vector2;
  drawDirection: THREE.Vector2;
  items: PieMenuItem[];
  activeItem: any;
  constructor(radius: number, autoAcceptRadius: number) {
    this.isOpen = false;
    this.center = new THREE.Vector2(0, 0);
    this.radius = radius;
    this.autoAcceptRadius = autoAcceptRadius;
    this.drawRadius = 1;
    this.items = [];
    this.direction = PIE_MENU_DIRECTIONS.t.direction;
    this.drawDirection = PIE_MENU_DIRECTIONS.t.direction;
  }

  open = (p: THREE.Vector2) => {
    this.center.copy(p);
    this.drawRadius = 1;
    this.isOpen = true;
  };

  close = () => {
    this.isOpen = false;
  };

  accept = (mouse: THREE.Vector2) => {
    console.log(this.activeItem);
    if (this.activeItem === undefined) {
      return;
    }
    if (this.activeItem.callback !== undefined) {
      const p = this.direction
        .clone()
        .normalize()
        .multiplyScalar(this.drawRadius)
        .add(this.center);

      this.activeItem.callback(p, mouse);
    }
  };

  onMouseDown = (p: THREE.Vector2) => {
    const distance = this.center.distanceTo(p);
    if (distance > this.radius) {
      this.close();
    }
  };

  onMouseUp = (p: THREE.Vector2) => {
    const distance = this.center.distanceTo(p);
    if (distance > this.radius) {
      this.accept(p);
      this.close();
    }
  };

  update = (delta: number, p: THREE.Vector2) => {
    if (this.isOpen) {
      if (this.drawRadius < this.radius) {
        this.drawRadius = Math.min(
          this.radius,
          this.drawRadius + this.radius * delta * 9
        );
      }
      const offset = p.clone().sub(this.center);
      const direction = offset.clone().normalize();
      const roundedDirection = direction.clone().round();
      this.direction = roundedDirection;
      this.drawDirection = roundedDirection.clone().normalize();

      const directionKey = [roundedDirection.x, roundedDirection.y];
      const directionObject = PIE_MENU_DIRECTIONS_BY_V2[directionKey];
      if (directionObject === undefined) {
        console.log("undefined directionObject", directionKey);
        return;
      }
      const directionName = directionObject.name;
      for (const item of this.items) {
        switch (item.zone.type) {
          case "direction": {
            if (item.zone.value !== directionName) {
              continue;
            }
            this.activeItem = item;
            this.direction = roundedDirection;
            if (item.autoAccept && offset.length() > this.autoAcceptRadius) {
              this.accept(p);
              this.close();
            }
            break;
          }
          case "range": {
            const angle = Math.atan2(direction.y, direction.x);
            const angle2 = angle >= 0 ? angle : Math.PI * 2 - Math.abs(angle);
            const angle3 = angle2 * (180 / Math.PI);
            if (item.zone.from <= angle3 && item.zone.to >= angle3) {
              this.activeItem = item;
              this.direction = direction;
              this.drawDirection = direction;

              if (item.rangeCallback) {
                item.rangeCallback(angle3);
              }

              if (item.autoAccept && offset.length() > this.autoAcceptRadius) {
                this.accept(p);
                this.close();
              }
            }
            break;
          }
        }
      }
    }
  };
}
