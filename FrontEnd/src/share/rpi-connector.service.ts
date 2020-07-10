import { Injectable } from '@angular/core';
import {Observable} from 'rxjs';
import {ScanData} from 'components/wifi-selector/wifi-selector.component'
import { HttpClient}  from '@angular/common/http';
import {SystemStatusService} from 'share/system-status.service'

@Injectable({
  providedIn: 'root'
})
export class RpiConnectorService {
  private rpiURL : string;
  constructor(private http: HttpClient, private statusServer: SystemStatusService) {
    this.statusServer.onSystemChangeIP().subscribe(res => {
      if (res.ip !== undefined){
        this.rpiURL = "https://".concat(res.ip,':8080');
      }
    });
  }

  public getRpiURL() : string {
    return this.rpiURL;
  }

  public setRpiUrl(url : string){
    this.rpiURL = url;
  }

  public scanAvailableWifi() : Observable<Array<ScanData>> {
    return this.http.get<Array<ScanData>>(this.rpiURL.concat('/scanWifi'));
  }

  public connectToSSID(ssid:string,mac:string,password:string){
    return this.http.post(this.rpiURL.concat('/setWifi'),{"ssid":ssid,"mac":mac,"password":password});
  }

  public setAccessPoint(){
    return this.http.get(this.rpiURL.concat('/setAP'),{});
  }

  public startSession(username: string,password:string) : Observable<any> {
    return this.http.post(this.rpiURL.concat('/startSession'),
    {"user":username,"password":password});
  }

  public isActiveSession() : Observable<{status:boolean}> {
    return this.http.get<{status:boolean}>(this.rpiURL.concat('/isActiveSession'));
  }

}
