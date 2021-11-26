import { Vector2 } from "three";

export class InteractionController {
  firstUpdate: boolean;
  mousePosPrevious: Vector2;
  mousePos: Vector2;
  mouseDelta: Vector2;
  wheelDelta: Vector2;
  wheelDeltaTemp: Vector2;
  leftDown: boolean;
  leftPressed: boolean;
  leftReleased: boolean;
  leftClicked: boolean;
  leftDownTime: Date;
  leftUpTime: Date;
  leftDownPos: Vector2;
  leftUpPos: Vector2;
  rightDown: boolean;
  rightPressed: boolean;
  rightReleased: boolean;
  rightClicked: boolean;
  rightDownTime: Date;
  rightUpTime: Date;
  rightDownPos: Vector2;
  rightUpPos: Vector2;
  shiftDown: boolean;
  shiftDownTemp: boolean;
  constructor() {
    this.firstUpdate = true;
    this.mousePosPrevious = new Vector2(0, 0);
    this.mousePos = new Vector2(0, 0);
    this.mouseDelta = new Vector2(0, 0);
    this.leftDown = false;
    this.leftClicked = false;
    this.leftDownTime = new Date();
    this.leftUpTime = new Date();
    this.leftDownPos = new Vector2(0, 0);
    this.leftUpPos = new Vector2(0, 0);
    this.rightDown = false;
    this.rightClicked = false;
    this.rightDownTime = new Date();
    this.rightUpTime = new Date();
    this.rightDownPos = new Vector2(0, 0);
    this.rightUpPos = new Vector2(0, 0);
    this.wheelDelta = new Vector2(0, 0);
    this.wheelDeltaTemp = new Vector2(0, 0);
    this.shiftDown = false;
    this.shiftDownTemp = false;
  }
  install(element: HTMLElement) {
    element.addEventListener("mousemove", (event: MouseEvent) => {
      this.mousePos.set(event.clientX, event.clientY);
    });
    element.addEventListener("click", (event: MouseEvent) => {
      event.preventDefault();
      console.log("click", event.type, event.button, event.buttons);
    });
    element.addEventListener("mousedown", (event: MouseEvent) => {
      event.preventDefault();
      console.log("mousedown", event.type, event.button, event.buttons);
      if (event.button === 0) {
        this.leftDown = true;
        this.leftDownPos = this.mousePos;
        this.leftDownTime = new Date();
        this.leftPressed = true;
      } else if (event.button === 2) {
        this.rightDown = true;
        this.rightDownPos = this.mousePos;
        this.rightDownTime = new Date();
        this.rightPressed = true;
      }
    });
    element.addEventListener("mouseup", (event: MouseEvent) => {
      event.preventDefault();
      console.log("mouseup", event.type, event.button, event.buttons);
      if (event.button === 0) {
        this.leftDown = false;
        this.leftUpPos = this.mousePos;
        this.leftUpTime = new Date();
        this.leftClicked = true;
        this.leftReleased = true;
      } else if (event.button === 2) {
        this.rightDown = false;
        this.rightUpPos = this.mousePos;
        this.rightUpTime = new Date();
        this.rightClicked = true;
        this.rightReleased = true;
      }
    });
    element.addEventListener("wheel", (event: WheelEvent) => {
      this.wheelDeltaTemp.add(new Vector2(event.deltaX, event.deltaY));

      event.target.scrollLeft = 0;
      event.target.scrollTop = 0;
    });
    element.addEventListener("mousewheel", (event: WheelEvent) => {
      // this.wheelDeltaTemp.add(new Vector2(event.deltaX, event.deltaY));
      event.preventDefault();

      event.target.scrollLeft = 0;
      event.target.scrollTop = 0;
    });
    document.addEventListener("keydown", (event: KeyboardEvent) => {
      console.log("keydown", event.shiftKey, event.key, event.type, event.code);
      if (event.code === "ShiftLeft") {
        this.shiftDownTemp = true;
      }
    });
    document.addEventListener("keyup", (event: KeyboardEvent) => {
      if (event.code === "ShiftLeft") {
        this.shiftDownTemp = false;
      }
    });
  }
  update() {
    this.firstUpdate = false;
    this.leftClicked = false;
    this.leftPressed = false;
    this.leftReleased = false;
    this.rightClicked = false;
    this.rightPressed = false;
    this.rightReleased = false;
    this.mouseDelta.copy(this.mousePos).sub(this.mousePosPrevious);
    this.mousePosPrevious.copy(this.mousePos);
    this.wheelDelta.copy(this.wheelDeltaTemp);
    this.wheelDeltaTemp.set(0, 0);
    this.shiftDown = this.shiftDownTemp;
  }
}
