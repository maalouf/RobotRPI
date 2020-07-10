import {exec} from "child_process";
import {ControlPi} from "../services/controlPi"
export class RobotController {
  //motor A1, B1
  private conPi : ControlPi;
  private bVAxis : number;
  private bHAxis : number;
  private latestAxis : Axis;
  constructor(){
    this.conPi = ControlPi.getInstance();
    this.bHAxis = 0;
    this.bVAxis = 0;
    this.latestAxis = {"leftXAxis": 0,"leftYAxis": 0, "rightXAxis": 0,
    "rightYAxis": 0, "fixedHAxis" : 0,"fixedVAxis": 0};
  }
  private robotEngin(but: ButtonState){
    if (but.state == 0) {
      console.log("stop axial movement")
      this.conPi.stopAxialMovement();
    } else {
      if (but.label == ButtonLabel.crossUp){
        console.log("move forward");
        this.conPi.moveForward();
      } else {
        console.log("move backward");
        this.conPi.moveBackward();
      }
    }

  }

  private robotStearing(but: ButtonState){
    if (but.state == 0){
      console.log("stop stearing")
      this.conPi.stopStearing();
    } else {
      if (but.label == ButtonLabel.crossRight){
        console.log("move right");
        this.conPi.moveRight();
      } else {
        console.log("move left");
        this.conPi.moveLeft();
      }
    }
  }

  private robotSpeed(but : ButtonState){
    if(but.state == 1){
      if(but.label == ButtonLabel.L){
        console.log("speed up")
        this.conPi.speedUpANotch();
      } else {
        console.log("speed down")
        this.conPi.speedDownANotch();
      }
    }
  }


  public handeAxies(data: Axis){
    this.latestAxis = Object.assign({},data);
    data.fixedHAxis = this.bHAxis;
    data.fixedVAxis = this.bVAxis;
    this.conPi.handleAxis(this.remapAxis(data));
  }

  private remapAxis(data: Axis): Axis{
    let max = 0.7;
    let output = {"leftXAxis": data.leftXAxis * max,
    "leftYAxis": - data.leftYAxis * max, "rightXAxis": data.rightXAxis * max,
    "rightYAxis": data.rightYAxis * max, "fixedHAxis" : data.fixedHAxis,
    "fixedVAxis": data.fixedVAxis};
    return output;
  }

  public handleButtonsClick(data: Array<ButtonState>){

    data.forEach(but => {
      switch(but.label){
        case ButtonLabel.crossUp:
        case ButtonLabel.crossDown:{
          this.robotEngin(but);
          break;
        }
        case ButtonLabel.crossLeft:
        case ButtonLabel.crossRight:{
          this.robotStearing(but);
          break;
        }
        case ButtonLabel.L2:
        case ButtonLabel.L: {
          this.robotSpeed(but);
          break;
        }
        case ButtonLabel.R: {
          if(but.state == 1){
            this.conPi.initializeHand().then(()=>{});
          }
          break;
        }
        case ButtonLabel.start: {
          this.conPi.initializeHand().then(()=> {
            this.conPi.clearAllLCD();
            this.conPi.sendText("Shutting down System.",4);
            exec("sudo shutdown now");
          });
          break;
        }
        case ButtonLabel.A:
        case ButtonLabel.Y:{
          if (but.state == 1){
            this.bVAxis = (but.label == ButtonLabel.A) ? -0.5 : 0.5;
          } else {
            this.bVAxis = 0;
          }
          this.handeAxies(this.latestAxis);
          break;
        }
        case ButtonLabel.X:
        case ButtonLabel.B:{
          if (but.state == 1){
            this.bHAxis = (but.label == ButtonLabel.X) ? -0.5 : 0.5;
          } else {
            this.bHAxis = 0;
          }
          this.handeAxies(this.latestAxis);
          break;
        }

      }
    })
  }
}

export interface ButtonState {
  id: number;
  label: ButtonLabel;
  state: 0|1;
}
export interface Axis {
  leftXAxis : number;
  leftYAxis : number;
  rightXAxis : number;
  rightYAxis : number;
  fixedVAxis? : number;
  fixedHAxis? : number;
}

export enum ButtonLabel {
  "crossUp"="crossUp","crossDown"="crossDown","crossLeft"="crossLeft","crossRight"="crossRight",
  "X"="X","Y"="Y","A"="A","B"="B","start"="start","select"="select","leftAxisClick"="leftAxisClick",
  "rightAxisClick"="rightAxisClick","L"="L","L2"="L2","R"="R","R2"="R2"
}
