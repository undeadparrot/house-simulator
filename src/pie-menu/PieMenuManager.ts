import * as THREE from "three";
import { PieMenu } from "./PieMenu";
import { PIE_MENU_DIRECTIONS } from "./types";
const CENTER_RADIUS = 8;

export class PieMenuManager {
  pies: PieMenu[];
  private _mouse: THREE.Vector2;
  private _canvas: HTMLCanvasElement;
  private _ctx: CanvasRenderingContext2D;
  constructor(pies: PieMenu[]) {
    this.pies = pies;
    this._mouse = new THREE.Vector2();

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
  mouseup = (e) => {
    const x = e.clientX - e.target.offsetLeft;
    const y = e.clientY - e.target.offsetTop;
    const p = new THREE.Vector2(x, y);
    for (const pie of this.pies) {
      if (pie.isOpen) {
        pie.onMouseUp(p);
      }
    }
  };

  mousemove = (e: MouseEvent): void => {
    const x = e.clientX - e.target.offsetLeft;
    const y = e.clientY - e.target.offsetTop;
    this._mouse.set(x, y);
  };
  mousedown = (e) => {
    const x = e.clientX - e.target.offsetLeft;
    const y = e.clientY - e.target.offsetTop;
    const p = new THREE.Vector2(x, y);
    if (this.pies.filter(pie => pie.isOpen).length === 0) {
      this.pies[0].open(p);
    } else {
      for (const pie of this.pies) {
        if (pie.isOpen) {
          pie.onMouseDown(p);
        }
      }
    }
  };
  install = (element: HTMLElement) => {
    element.addEventListener("mousedown", this.mousedown);
    element.addEventListener("mouseup", this.mouseup);
    element.addEventListener("mousemove", this.mousemove);
    window.addEventListener("resize", this.resizeWindow);
    this.resizeWindow();
  };
  update = (delta: number) => {
    const { width, height } = this._canvas;
    this._ctx.clearRect(0, 0, width, height);
    this._ctx.lineWidth = 1;
    for (const pie of this.pies) {
      const { isOpen, drawRadius, autoAcceptRadius, center, drawDirection } =
        pie;

      if (isOpen) {
        this._ctx.fillStyle = "green";
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
              this._ctx.fillRect(
                p.x - CENTER_RADIUS,
                p.y - CENTER_RADIUS,
                CENTER_RADIUS * 2,
                CENTER_RADIUS * 2
              );
              this._ctx.strokeStyle = "black";
              this._ctx.textAlign = "center";
              this._ctx.strokeText(item.name, p.x, p.y + CENTER_RADIUS * 2);

              break;
            }
            case "range": {
              const p = new THREE.Vector2(1, 0)
                .clone()
                .normalize()
                .multiplyScalar(drawRadius)
                .add(center);

              const fromRadians = (item.zone.from / 180) * Math.PI;
              const toRadians = (item.zone.to / 180) * Math.PI;
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

        pie.update(delta, this._mouse);
      }
    }
  };
}
