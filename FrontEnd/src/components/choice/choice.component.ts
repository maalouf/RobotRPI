import { Component, OnInit,NgZone,OnDestroy } from '@angular/core';
import {SystemStatus, SystemStatusService} from 'share/system-status.service';
import {RpiConnectorService} from 'share/rpi-connector.service'
import {Router} from '@angular/router';

@Component({
  selector: 'app-choice',
  templateUrl: './choice.component.html',
  styleUrls: ['./choice.component.css']
})
export class ChoiceComponent implements OnInit, OnDestroy{
  status : SystemStatus = {wifi:false,accessPoint:false,ip:undefined,stength:0,battery :0,gamePad:false};
  isConnected : boolean;
  ipServer : string;
  private subs : Array<any>;
  constructor(private systemStatus : SystemStatusService, private rpi : RpiConnectorService,
  private route : Router,private zone: NgZone) { }
  ngOnDestroy(): void {
    this.subs.forEach(x => x.unsubscribe());
  }

  ngOnInit(): void {
    this.subs = new Array<any>();
    this.ipServer = "";
    this.subs.push(this.systemStatus.onSystemChangeIP().subscribe(stat => {
      this.status = stat;
    }));
    this.subs.push(this.systemStatus.onsystemChanheInfo().subscribe(stat => {
      this.status = stat;
      this.isConnected = this.status.wifi || this.status.accessPoint;
      if (this.status.ip !== undefined){
        localStorage.setItem('latestRobot',this.status.ip);
        this.ipServer = this.status.ip;
      }
    }));
  }

  setIp(){
    this.systemStatus.setCurrentIp(this.ipServer);
  }

  gotoWifi(){
    this.zone.run(()=> {
      this.route.navigate(['scanWifi']);
    })
  }
  makeAP(){
    this.rpi.setAccessPoint().subscribe(()=>{});
    this.ipServer = this.systemStatus.apIP;
    this.setIp();
  }
  drive(){
    this.zone.run(()=> {
      this.route.navigate(['home'])
    })
  }

}
