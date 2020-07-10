export class Size {
  w : number;
  h: number;
  constructor(w:number, h:number){
    this.w = w;
    this.h = h;
  }
  toString() {
    return "(" + this.w + ", " + this.h + ")";
  }
  getHalfSize() {
    return new Size(this.w >>> 1, this.h >>> 1);
  }

  length() {
    return this.w * this.h;
  }
}
