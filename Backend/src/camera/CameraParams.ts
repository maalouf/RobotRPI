import os from 'os'

export enum Rotation {
  "Rot0" = 0,
  "Rot90" = 90,
  "Rot180" = 180,
  "Rot270" = 270
}
export class CameraParams {
  width:number;
  height:number;
  fps: number;
  rotation: Rotation;
  flipHorisontal : boolean;
  flipVertical : boolean;

  constructor(){
    this.width = 640;
    this.height= 480;
    this.fps = 30;
    this.rotation = Rotation.Rot0;
    this.flipVertical = false;
    this.flipHorisontal = false;
  }

  createCommand() : Array<string>{
    let args = ["-w",this.width.toString(),"-h",this.height.toString(),
    "-fps", this.fps.toString(),"-t","0","-cd","MJPEG"];
    if (this.rotation !== Rotation.Rot0){
      args.push("-rot");
      args.push(this.rotation.toString());
    }
    if (this.flipVertical) args.push("-vf");
    if (this.flipHorisontal) args.push("-hf");
    args.push("-o");
    args.push("-");
    return args;
  }

}
