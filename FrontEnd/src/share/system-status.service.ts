import { Injectable } from '@angular/core';
import {BehaviorSubject} from 'rxjs'
import { Socket } from 'ngx-socket-io'
import { HttpClient}  from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})

export class SystemStatusService {
  private systemStatIP : BehaviorSubject<SystemStatus>;
  private systemStatInfo : BehaviorSubject<SystemStatus>;

  private status : SystemStatus;
  private socket : Socket;

  private currentIP: string;
  public apIP = "192.168.44.1";

  constructor(private http: HttpClient) {
    console.log("repwetwet")
    this.status = {wifi : false,accessPoint : false,ip : undefined,
      battery : 0, stength:0, gamePad: false};

    let latest = this.extractURL();
    this.systemStatIP = new BehaviorSubject<SystemStatus>(this.status);
    this.systemStatInfo = new BehaviorSubject<SystemStatus>(this.status);
    if (latest !== undefined && latest !== null){
      this.currentIP = latest;
    } else {
      this.currentIP = this.apIP;
    }
    this.checkCurrentIP();
  }

  private extractURL(): string {
    let url = location.href;
    let str = url.indexOf("://");
    str = str + 3;
    let end = url.indexOf(":",str);
    return url.substring(str,end);
  }

  private checkCurrentIP(){
    if (this.socket !== undefined){
      this.socket.disconnect();
      this.socket = undefined;
    }
    let url = "https://".concat(this.currentIP,':8080/connectStat')
    this.socket = new Socket({url:url,options:{}})
    this.socket.fromEvent("connect").subscribe(()=> {
      console.log("connected");
      this.status.ip = this.currentIP;
      this.status.accessPoint = this.currentIP == this.apIP;
      this.status.wifi = this.currentIP !== this.apIP;
      this.systemStatIP.next(this.status);
      if (this.status.wifi) this.controleSignal();
      this.controlBatt();
    })
  }

  private controleSignal(){
    this.http.get<any>("https://".concat(this.currentIP,':8080/getSignal')).subscribe(res => {
      this.status.stength = res.signal;
      this.systemStatInfo.next(this.status);
      let time = 120000;
      if (this.status.stength < 50) time = 60000;
      if (this.status.stength < 20) time = 30000;
      setTimeout(this.controleSignal.bind(this), time);
    });
  }

  private controlBatt(){
    this.http.get<any>("https://".concat(this.currentIP,':8080/getBattery')).subscribe(res => {
      this.status.battery = res.batt;
      this.systemStatInfo.next(this.status);
      setTimeout(this.controlBatt.bind(this),120000);
    });
  }

  setCurrentIp(ip: string){
    this.currentIP = ip;
    this.checkCurrentIP();
  }

  getSystemStatus(): SystemStatus {
    return this.status;
  }

  onSystemChangeIP() : BehaviorSubject<SystemStatus>{
    return this.systemStatIP;
  }

  onsystemChanheInfo(): BehaviorSubject<SystemStatus> {
    return this.systemStatInfo;
  }

  getRobotIp(): string {
    return this.status.ip;
  }
}

export interface SystemStatus {
  wifi : boolean;
  accessPoint : boolean;
  ip : string;
  battery : number;
  stength: number;
  gamePad: boolean;
}
