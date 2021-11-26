import { TOOL_DONE } from "./../constants";
import * as THREE from "three";
import { TOOL_BUSY, TOOL_CLOSING } from "../constants";
import { PieMenu } from "./PieMenu";
import { PIE_MENU_DIRECTIONS } from "./types";
const CENTER_RADIUS = 8;

export class PieMenuManager {
  pies: PieMenu[];
  private _canvas: HTMLCanvasElement;
  private _ctx: CanvasRenderingContext2D;
  constructor(pies: PieMenu[]) {
    this.pies = pies;

    this._canvas = document.getElementById("app-canvas")!;
    this._ctx = this._canvas.getContext("2d");
  }
  resizeWindow = () => {
    console.log("resize piemenu canvas");

    let ratio = window.devicePixelRatio;
    this._canvas.style.width = `${window.innerWidth}px`;
    this._canvas.style.height = `${window.innerHeight}px`;
    this._canvas.width = window.innerWidth * ratio;
    this._canvas.height = window.innerHeight * ratio;
    this._ctx.scale(ratio, ratio);
  };

  install = (element: HTMLElement) => {
    window.addEventListener("resize", this.resizeWindow);
    this.resizeWindow();
  };
  update = (
    delta: number,
    mouse: THREE.Vector2,
    mouseWasPressed: boolean,
    mouseWasReleased: boolean
  ): string => {
    const { width, height } = this._canvas;
    this._ctx.clearRect(0, 0, width, height);
    this._ctx.lineWidth = 1;
    if (mouseWasPressed) {
      if (this.pies.filter((pie) => pie.isOpen).length === 0) {
        this.pies[0].open(mouse);
      } else {
        for (const pie of this.pies) {
          if (pie.isOpen) {
            pie.onMouseDown(mouse);
          }
        }
      }
    }
    if (mouseWasReleased) {
      for (const pie of this.pies) {
        if (pie.isOpen) {
          pie.onMouseUp(mouse);
        }
      }
    }
    for (const pie of this.pies) {
      const {
        isOpen,
        drawRadius,
        autoAcceptRadius,
        center,
        drawDirection,
      } = pie;

      if (isOpen) {
        this._ctx.fillStyle = "purple";
        this._ctx.fillRect(
          center.x - CENTER_RADIUS,
          center.y - CENTER_RADIUS,
          CENTER_RADIUS * 2,
          CENTER_RADIUS * 2
        );

        this._ctx.strokeStyle = "blue";
        this._ctx.beginPath();
        this._ctx.ellipse(
          center.x,
          center.y,
          drawRadius,
          drawRadius,
          0,
          0,
          Math.PI * 2
        );
        this._ctx.closePath();
        this._ctx.stroke();

        this._ctx.strokeStyle = "silver";
        this._ctx.beginPath();
        this._ctx.ellipse(
          center.x,
          center.y,
          autoAcceptRadius,
          autoAcceptRadius,
          0,
          0,
          Math.PI * 2
        );
        this._ctx.closePath();
        this._ctx.stroke();

        pie.items.map((item) => {
          switch (item.zone.type) {
            case "direction": {
              const direction: THREE.Vector2 =
                PIE_MENU_DIRECTIONS[item.zone.value].direction;

              const p = direction
                .clone()
                .normalize()
                .multiplyScalar(drawRadius)
                .add(center);
              this._ctx.fillStyle = "blue";
              this._ctx.fillRect(
                p.x - CENTER_RADIUS,
                p.y - CENTER_RADIUS,
                CENTER_RADIUS * 2,
                CENTER_RADIUS * 2
              );
              this._ctx.font = "12px sans-serif";
              this._ctx.textAlign = "center";
              const textmetrics = this._ctx.measureText(item.name);
              this._ctx.fillStyle = "#EEE";
              this._ctx.fillRect(
                p.x - textmetrics.actualBoundingBoxLeft - 2,
                p.y + CENTER_RADIUS - 2,
                textmetrics.width + 2,
                12 + 2
              );
              this._ctx.fillStyle = "black";
              this._ctx.fillText(item.name, p.x, p.y + CENTER_RADIUS * 2);

              break;
            }
            case "range": {
              const fromRadians = (item.zone.from / 180) * Math.PI;
              const toRadians = (item.zone.to / 180) * Math.PI;
              const midRadians = fromRadians + (toRadians - fromRadians) / 2;
              const unitVector = new THREE.Vector2(
                Math.cos(midRadians),
                Math.sin(midRadians)
              );
              const p = unitVector
                .clone()
                .multiplyScalar(drawRadius)
                .add(center);

              this._ctx.fillStyle = "lightgray";
              this._ctx.beginPath();
              this._ctx.moveTo(center.x, center.y);
              this._ctx.ellipse(
                center.x,
                center.y,
                drawRadius * 0.9,
                drawRadius * 0.9,
                0,
                fromRadians,
                toRadians
              );
              this._ctx.lineTo(center.x, center.y);

              this._ctx.closePath();
              this._ctx.fill();

              this._ctx.fillStyle = "black";
              this._ctx.fillText(item.name, p.x, p.y - CENTER_RADIUS);

              if (item.tickAngle !== undefined) {
                const tickRadians = (item.tickAngle / 180.0) * Math.PI;
                unitVector.set(Math.cos(tickRadians), Math.sin(tickRadians));
                p.copy(unitVector).multiplyScalar(drawRadius).add(center);
                this._ctx.beginPath();
                this._ctx.moveTo(center.x, center.y);
                this._ctx.lineTo(p.x, p.y);
                this._ctx.stroke();
              }
              break;
            }
          }
        });

        this._ctx.strokeStyle = "blue";
        this._ctx.beginPath();
        this._ctx.moveTo(center.x, center.y);
        this._ctx.lineTo(
          center.x + drawDirection.x * drawRadius,
          center.y + drawDirection.y * drawRadius
        );
        this._ctx.closePath();
        this._ctx.stroke();

        pie.update(delta, mouse);
      }
    }
    for (const pie of this.pies) {
      if (pie.isOpen) {
        return TOOL_BUSY;
      }
      if (pie.drawRadius > 0) {
        // return TOOL_CLOSING;
      }
    }
    this._ctx.clearRect(0, 0, width, height);
    return TOOL_DONE;
  };
}
