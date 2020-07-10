import SerialPort from "serialport"
import Readline from "@serialport/parser-readline"
import {Axis} from "../API/RobotController"
export class ControlPi {
  private static instance : ControlPi;
  private serial : SerialPort;
  private parser : Readline;

  public static getInstance(): ControlPi {
    if (!ControlPi.instance){
      ControlPi.instance = new ControlPi();
    }
    return ControlPi.instance;
  }

  constructor(){
    this.serial = new SerialPort("/dev/ttyS0",{baudRate:115200});
    this.parser = new Readline()
    this.serial.pipe(this.parser);
  }

  speedUpANotch(){
    this.serial.write("P+#");
  }

  speedDownANotch(){
    this.serial.write("P-#");
  }

  moveForward(){
    this.serial.write("MF#");
  }
  moveBackward(){
    this.serial.write("MB#");
  }

  stopAxialMovement(){
    this.serial.write("HM#");
  }

  moveLeft(){
    this.serial.write("SL#");
  }

  moveRight(){
    this.serial.write("SR#");
  }

  stopStearing(){
    this.serial.write("HS#");
  }

  handleAxis(axis: Axis){
    this.serial.write("A;".concat(axis.leftXAxis.toString(),";",axis.leftYAxis.toString(),
    ";",axis.rightXAxis.toString(),";",axis.rightYAxis.toString(),";",axis.fixedVAxis.toString(),
    ";",axis.fixedHAxis.toString(),"#"));
  }

  getBattery() : Promise<string>{
    return new Promise(resolve => {
      this.parser.once('data', (line:string) => {
        resolve(line);
      });
      this.serial.write("GT#");
    });
  }

  sendText(str : string,line:number,col?:number){
    let y = Math.min(line,7) * 8;
    let x = (col == undefined)?0:Math.min(col,127);
   this.serial.write("V".concat(x.toString(),";",y.toString(),";",str,"#"));
  }
  clearLines(line: number,nb:number){
    let ln = Math.min(line,7) * 8;
    this.serial.write("V$".concat(ln.toString(),";",nb.toString(),"#"));
  }

  clearAllLCD(){
    this.serial.write("V%#");
  }

  initializeHand() : Promise<boolean>{
    return new Promise(resolve => {
      this.parser.once('data', (_line:string) => {
        resolve(true);
      });
      this.serial.write("I#");
    });
  }
}
