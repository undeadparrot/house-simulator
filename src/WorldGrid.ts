import * as THREE from "three";
export class WorldGrid {
  public w: number;
  public h: number;
  public data: number[][];
  public get(x: number, y: number) {
    if (x >= this.w || y >= this.h) {
      return null;
    }
    if (x < 0 || y < 0 ) {
      return null;
    }
    return this.data[x][y];
  }
  public brush(p0: THREE.Vector2, width: number, strength: number) {
    const blocksRadius = Math.ceil(width/2);
    const p1 = new THREE.Vector2();
    console.group()
    for(let x = p0.x-blocksRadius; x < p0.x+blocksRadius; x++){
      for(let y = p0.y-blocksRadius; y < p0.y+blocksRadius; y++){
        if(x >= this.w || y >= this.h || x < 0 || y < 0){
          continue;
        }
        p1.set(x,y);
        const distance = p0.distanceTo(p1);
        const diff = Math.min(Math.max(distance/blocksRadius, 0), 1);
        console.log([p0.x, p0.y], [x,y], distance, blocksRadius, diff);
        this.data[x][y] += strength*diff;
      }
    }
    console.groupEnd()
  }
  constructor(x: number, y: number ) {
    this.w = x;
    this.h = y;
    this.data = [];

    for (let x = 0; x < this.w; x++) {
      this.data.push([]);
      for (let y = 0; y < this.h; y++) {
        this.data[x].push((x+y)*0.05);
      }
    }

  }
}
