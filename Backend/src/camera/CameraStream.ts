#!/usr/bin/env node
import http from "http";
import PubSub from "pubsub-js"
import {CameraParams} from "./CameraParams";
import { ChildProcess, spawn } from 'child_process';
import Split from 'stream-split';
import {ImageProcessing} from "./ImageProcessing";

export class CameraStream {
  parameters : CameraParams;
  server : http.Server;
  private listeners : number;
  private child : ChildProcess;
  private jpegStart : Buffer;
  private imageProcess : ImageProcessing;
  constructor(params ?: CameraParams){
    this.parameters = (params !== undefined)? params : new CameraParams();
    this.parameters.flipVertical = true;
    this.parameters.flipHorisontal = true;
    this.listeners = 0;
    this.jpegStart = Buffer.from([0xff, 0xd8, 0xff, 0xdb, 0x00, 0x84, 0x00]);
  //  this.imageProcess = new ImageProcessing(true);
  }

  listenToCamera() {
    console.log("gogo")
    if (this.listeners < 1){
      this.listeners = 1;
      console.log("gogo2")
      this.child = spawn("raspivid",this.parameters.createCommand(), {
        stdio: ['ignore', 'pipe', 'inherit']
      });
      this.child.on('error', (processError: any) => {
        console.log(processError)
      });
      this.child.stdout.pipe(new Split(this.jpegStart)).on("data", (data:any)=> {
        let buffer = Buffer.concat([this.jpegStart,data]);
        PubSub.publish('MJPEG', buffer);
      });
    }
  }

  unlistenToCamera(){
    this.listeners--;
    if (this.listeners < 1){
      this.child.kill();
      this.listeners = 0;
    }
  }
  start(){
    this.server = http.createServer(((req:any, res:any) => {
      if (req.url === "/") {
        res.writeHead(200, { "content-type": "text/html;charset=utf-8" });
        res.write('<!doctype html>');
        res.write('<html>');
        res.write('<head><title> PI server </title><meta charset="utf-8" /></head>');
        res.write('<body>');
        res.write('<img src="image.jpg" />');
        res.write('</body>');
        res.write('</html>');
        res.end();
        return;
      }
      if (req.url === "/healthcheck") {
        res.statusCode = 200;
        res.end();
        return;
      };
      if (req.url.match(/^\/.+\.jpg$/)) {
        this.listenToCamera();
        res.writeHead(200, {
          'Content-Type': 'multipart/x-mixed-replace;boundary="BOUNDARY"',
          'Connection': 'keep-alive',
          'Expires': 'Fri, 27 May 2200 00:00:00 GMT',
          'Cache-Control': 'no-cache, no-store, max-age=0, must-revalidate',
          'Pragma': 'no-cache'
        });
        var subscriber_token = PubSub.subscribe('MJPEG',(_msg:any, data:Buffer) => {
          res.write('--BOUNDARY\r\n')
          res.write('Content-Type: image/jpeg\r\n');
          res.write('Content-Length: ' + data.length + '\r\n');
          res.write("\r\n");
          res.write(data,'binary');
          res.write("\r\n");
        });
        res.on('close', (function() {
          console.log("Connection closed!");
          this.unlistenToCamera();
          PubSub.unsubscribe(subscriber_token);
          res.end();
        }).bind(this));
      }
    }).bind(this));

    this.server.on('error',e=>{
      console.log("error ", e);
      process.exit(1);
    });

    this.server.listen(4000);

  }
}
