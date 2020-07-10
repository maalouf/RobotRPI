import opencv from 'opencv4nodejs';
import PubSub from "pubsub-js"
export class ImageProcessing {
  subscriber : any;
  constructor(useInternal ?: boolean){
    if (useInternal == true){
      this.subscriber = PubSub.subscribe('MJPEG',(_msg:any, data:Buffer) => {
        this.processDataInternal(data);
      });
    }
    //this.matImage = new opencv.Mat(this.parameters.height,this.parameters.width,opencv.CV_8UC1);

  }
  processData(buffer: Buffer){
    this.processDataInternal(buffer);
  }
  private processDataInternal(buffer:Buffer) {
    console.log("*************")
    //let mat = opencv.imdecode(buffer,opencv.IMREAD_COLOR);
    //opencv.imdecode(buffer,opencv.IMREAD_GRAYSCALE)
    opencv.imdecodeAsync(buffer,opencv.IMREAD_GRAYSCALE).then((mat : opencv.Mat) => {

    })

  }
}
