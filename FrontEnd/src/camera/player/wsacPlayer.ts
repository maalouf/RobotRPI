

import * as Avc from '../broadway/Decoder';
import {WebGLCanvas} from '../data/WebGLCanvas'
import {Subject} from 'rxjs'
declare var OffscreenCanvas : any;
export class WSAvcPlayer{
  private canvas : any;
  private webGLCanvas : WebGLCanvas;
  private avc : Avc;
  private ws : WebSocket;
  private framesList: Array<any>;
  private running : boolean = false;

  private dataSubject : Subject<any>;
  private msgSubject : Subject<any>;

  private timer : any;

  constructor(canvas?:any) {
    this.canvas = (canvas !== undefined) ? canvas : new OffscreenCanvas(1280,720);
    this.avc = new Avc();
    this.dataSubject = new Subject<any>();
    this.msgSubject = new Subject<any>();
  }

  private shiftFrame() {
    if(!this.running){
      clearTimeout(this.timer);
      return;
    }

    let frame = this.framesList.shift();
    if(this.framesList.length > 10) {
      console.log("Dropping frames", this.framesList.length);
      this.msgSubject.next({"msg":"droping","payload":this.framesList.length})
      this.framesList = [];
    }
    if(frame)
      this.avc.decode(frame);
    this.timer = setTimeout(this.shiftFrame.bind(this),10);
  }


  connect(url : string) {
    if (this.ws != undefined) {
      this.ws.close();
      this.ws = undefined;
    }
    try{
      this.ws = new WebSocket(url);
    } catch(e){console.log(e)}

    this.ws.binaryType = "arraybuffer"
    this.ws.onopen = () => {
      this.msgSubject.next({"msg":"connected","payload":url})
      console.log("Connected to " + url);
    };
    this.ws.onerror = (evt) => {
      this.msgSubject.next({"msg":"error","payload":evt.type})
      console.log('Error',evt.type)
    };
    this.framesList = new Array<any>();
    this.ws.onmessage = (evt) => {
      if(typeof evt.data == "string")
      return this.cmd(JSON.parse(evt.data));
      this.framesList.push(new Uint8Array(evt.data));
    };
    this.running = true;
    this.shiftFrame();
    this.ws.onclose = () => {
      this.running = false;
      this.msgSubject.next({"msg":"closed","payload":{}})
      console.log("WSAvcPlayer: Connection closed")
    };
  }


  initCanvas(width:number, height:number) {
    this.webGLCanvas = new WebGLCanvas(this.canvas,width, height);
    this.avc.onPictureDecoded = (buffer:any, width:number, height:number)=> {
      let output = this.webGLCanvas.decode(buffer, width, height);
      this.dataSubject.next(output);
    }
  }

  cmd(cmd:any){
    console.log("Incoming request", cmd);
    if(cmd.action == "init") {
      this.initCanvas(cmd.width, cmd.height);
      this.canvas.width  = cmd.width;
      this.canvas.height = cmd.height;
    }
  }

  onDataDecoded():Subject<any> {
    return this.dataSubject;
  }

  onMessage():Subject<any> {
    return this.msgSubject;
  }

  disconnect() {
    this.ws.close();
  }

  playStream() {
    var message = "REQUESTSTREAM ";
    this.ws.send(message);
    console.log("Sent " + message);
  }

  sendData(data:string){
    this.ws.send(data);
  }

  finalize(){
    this.stopStream();
    this.disconnect();
    this.dataSubject.complete();
    this.msgSubject.complete();
  }


  stopStream () {
    this.ws.send("STOPSTREAM");
    console.log("Sent STOPSTREAM");
  }
}
