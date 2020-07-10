
import {Observable} from 'rxjs'

declare let OffscreenCanvas : any

export class IpStreamPlayer {
  private worker : Worker;
  private canvas : any;
  private outputCanvas : HTMLCanvasElement;
  private contextOut : CanvasRenderingContext2D;
  private stream : MediaStream;
  private playing: boolean = false;
  private uri : string;
  private status : string  = 'idle';

  constructor(url:string, canvasOut ?: HTMLCanvasElement){
    this.uri = 'wss://'.concat(url);
    this.outputCanvas = canvasOut ;
    this.canvas = new OffscreenCanvas(1280,720);
  //  this.outputCanvas.width = 1280;
  //  this.outputCanvas.height = 720;
    this.contextOut = this.outputCanvas.getContext('2d');
    this.initWorker();
    this.playing = false;
  }

  initWorker(){
    this.worker = new Worker('camera/pi-player.worker',{type:'module'});
    this.worker.postMessage({cmd:'init',canvas: this.canvas}, [this.canvas]);
    this.worker.postMessage({cmd:'connect',url:this.uri});
    this.worker.addEventListener('message',event => {
      if (event.data.type == "msg"){
        switch(event.data.data.msg){
          case "droping" : break;
          case "connected":{
            this.status = "connected";
            break;
          }
          case "error":{
            this.status = "error";
          }
          case "closed":{
            this.playing = false;
            if (this.worker !== undefined) this.worker.terminate();
            this.worker = undefined;
            break;
          }
          default:{}
        }
      } else {
        if(event.data.data !== undefined && event.data.data.buffer !== undefined){
          this.contextOut.putImageData(new ImageData(new Uint8ClampedArray(event.data.data.buffer),
          event.data.data.width,event.data.data.height),0,0,0,0,640,360);
        }
      }
    });
  }

  getStream() : MediaStream{
    return this.stream;
  }

  private waitToPlay(callback: Function,retry:number){
    if(this.playing == false){
      if (this.status == "connected"){
        this.worker.postMessage({cmd:'play'});
        this.playing = true;
        callback({status:true});
      } else if(this.status == "error"){
        this.playing = false;
        callback({status:false});
      } else {
        if (retry >= 0){
          retry--;
          setTimeout(this.waitToPlay.bind(this,callback,retry),100);
        } else {
          this.playing = false;
          callback({status:false});
        }
      }
    } else {
      callback({status:true});
    }
  }

  startPlaying() : Observable<any> {
    return new Observable<any>(observer => {
      if (this.worker == undefined) this.initWorker();
      this.waitToPlay((state:any) => {
        observer.next(state);
        observer.complete();
      },20);
    });
  }

  disconnect() {
    console.log("stop")
    this.playing = false;
    this.worker.postMessage({cmd:'disconnect'});
    this.worker.terminate();
    this.worker = undefined;

  }

  getCanvasRef(): HTMLCanvasElement{
    return this.canvas;
  }
}
