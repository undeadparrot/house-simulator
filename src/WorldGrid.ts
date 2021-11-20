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
  public toggle(x: number, y: number, value: number) {
    if (!this.get(x,y)) {
      this.data[x][y] = 0;
    }
    this.data[x][y] = value;
  }
  constructor(x: number, y: number ) {
    this.w = x;
    this.h = y;
    this.data = [];

    for (let x = 0; x < this.w; x++) {
      this.data.push([]);
      for (let y = 0; y < this.h; y++) {
        this.data[x].push(y*0.5);
      }
    }

  }
}
