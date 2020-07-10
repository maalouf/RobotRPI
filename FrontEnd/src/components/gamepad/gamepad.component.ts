import { Component, OnInit,NgZone,OnDestroy} from '@angular/core';
import { Socket }                 from 'ngx-socket-io'
import {SystemStatusService} from 'share/system-status.service'
import {Router} from '@angular/router';

@Component({
  selector: 'app-gamepad',
  templateUrl: './gamepad.component.html',
  styleUrls: ['./gamepad.component.css']
})
export class GamepadComponent implements OnInit,OnDestroy {
  private socket : Socket;
  private gamepad : Gamepad;
  private axis : Axis;
  private buttons : Array<number>;
  private mapping : Map<number,string>;
  private url : string;
  private subscription : any;
  constructor(private zone : NgZone, private statusService: SystemStatusService,private route: Router) { }
  ngOnDestroy(): void {
    if (this.subscription) this.subscription.unsubscribe();
    this.socket.disconnect();
    this.socket = undefined;
  }
  buildMapping(){
    this.mapping = new Map<number,string>();
    this.mapping.set(12,"crossUp");
    this.mapping.set(13,"crossDown");
    this.mapping.set(14,"crossLeft");
    this.mapping.set(15,"crossRight");
    this.mapping.set(2,"X");
    this.mapping.set(3,"Y");
    this.mapping.set(0,"A");
    this.mapping.set(1,"B");
    this.mapping.set(9,"start");
    this.mapping.set(8,"select");
    this.mapping.set(10,"leftAxisClick");
    this.mapping.set(11,"rightAxisClick");
    this.mapping.set(4,"L");
    this.mapping.set(6,"L2");
    this.mapping.set(5,"R");
    this.mapping.set(7,"R2");
  }
  ngOnInit(): void {
    this.subscription = this.statusService.onSystemChangeIP().subscribe(data => {
      if (data.ip !== undefined){
        console.log("miaou",data.ip)
        this.url = "https://".concat(data.ip,':8080');
        if (this.socket !== undefined) this.socket = undefined;
        this.socket = new Socket({url:this.url.concat("/robot"),options:{}});
      }
    });

    window.addEventListener("gamepadconnected",(e:any) => {
      console.log(e);
      this.gamepad = e.gamepad;
      this.buttons = new Array<number>();
      e.gamepad.buttons.forEach((x:GamepadButton) => {
        this.buttons.push(x.value);
      });
      this.axis = {leftXAxis:0.0,leftYAxis:0.0,rightXAxis:0.0,rightYAxis:0.0};
      this.buildMapping();
    });
    window.addEventListener("gamepaddisconnected", function(e) {
      console.log("Gamepad disconnected")
      this.gamepad = undefined;
    });

    this.zone.runOutsideAngular(()=> {
      window.requestAnimationFrame(this.queryPadKeys.bind(this));
    })
  }

  private roundNumber(nb : number) : number {
    return parseFloat(nb.toFixed(1));
  }

  private handleAxes(axes : Readonly<Array<number>>){
    let lxAxis = this.roundNumber(axes[0]);
    let lyAxis = this.roundNumber(axes[1]);
    let rxAxis = this.roundNumber(axes[2]);
    let ryAxis = this.roundNumber(axes[3]);
    let dirty : boolean = false;
    if (this.axis.leftXAxis !== lxAxis){
      this.axis.leftXAxis = lxAxis;
      dirty = true;
    }
    if (this.axis.rightXAxis !== rxAxis){
      this.axis.rightXAxis = rxAxis;
      dirty = true;
    }
    if (this.axis.leftYAxis !== lyAxis){
      this.axis.leftYAxis = lyAxis;
      dirty = true;
    }
    if (this.axis.rightYAxis !==ryAxis){
      this.axis.rightYAxis = ryAxis;
      dirty = true;
    }
    if (dirty && this.socket!==undefined){
      this.socket.emit("gamepad",{id:"axis",data:this.axis})
    }
  }

  private handleButtons(buts : Readonly<Array<GamepadButton>>){
    let buttonsState = {"changed":[],"clicked":[]};
    buts.forEach((x,index) => {
      if (this.buttonChanged(x,index)){
        buttonsState.changed.push({id:index,label:this.mapping.get(index),state:x.value});
      }
      if (x.pressed){
        buttonsState.clicked.push({id:index,label:this.mapping.get(index),state:x.value});
      }
    });
    if (buttonsState.changed.length > 0 && this.socket !== undefined){
      console.log(buttonsState.changed)
      this.socket.emit("gamepad",{id:"buttonsChanged",data:buttonsState.changed});
    }
    if (buttonsState.clicked.length > 0){
    //  this.socket.emit("gamepad",{id:"buttonsKeepClicked",data:buttonsState.clicked});
    }
    let indok = buttonsState.changed.findIndex(x => x.label == "start");
    if (indok >= 0){
      this.zone.run(()=> {
        this.route.navigate([""]);
      })
    }
  }

  private buttonChanged(button:GamepadButton, index: number): boolean {
    if (button.value !== this.buttons[index]){
      this.buttons[index] = button.value;
      return true;
    } else {
      return false;
    }
  }

  queryPadKeys(){
    if (this.gamepad !== undefined){
      let gp = navigator.getGamepads()[this.gamepad.index];
      this.handleAxes(gp.axes);
      this.handleButtons(gp.buttons);
    }
    window.requestAnimationFrame(this.queryPadKeys.bind(this));
  }

}

export interface Axis {
  leftXAxis : number;
  leftYAxis : number;
  rightXAxis : number;
  rightYAxis : number;
}
