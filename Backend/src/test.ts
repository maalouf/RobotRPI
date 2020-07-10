import {CameraParams} from "./camera/CameraParams";
import { ChildProcess, spawn } from 'child_process';
import Split from 'stream-split';
import opencv from 'opencv4nodejs';

let parameters = new CameraParams();
parameters.flipHorisontal = true;
let jpegStart = Buffer.from([0xff, 0xd8, 0xff, 0xdb, 0x00, 0x84, 0x00]);

let child = spawn("raspivid",parameters.createCommand(), {
    stdio: ['ignore', 'pipe', 'inherit']
});

child.on('error', (processError: any) => {
  console.log(processError)
});

child.stdout.pipe(new Split(jpegStart)).on("data", (data:any)=> {
    let buffer = Buffer.concat([jpegStart,data]);
    let mat = opencv.imdecode(buffer);

});
