import { Component, OnInit,NgZone } from '@angular/core';
import {RpiConnectorService} from 'share/rpi-connector.service';
import {MatDialog} from '@angular/material/dialog';
import {PasswordDialogComponent} from 'components/password-dialog/password-dialog.component';
import { Router }  from '@angular/router';


@Component({
  selector: 'app-wifi-selector',
  templateUrl: './wifi-selector.component.html',
  styleUrls: ['./wifi-selector.component.css']
})
export class WifiSelectorComponent implements OnInit {
  public showSpin: boolean = true;
  constructor(private rpiService : RpiConnectorService, private dialog : MatDialog,
  private zone: NgZone, private router: Router) {}
  public wifiList : Array<ScanData> = new Array<ScanData>();

  private fetchData(){
    this.showSpin = true;
    this.rpiService.scanAvailableWifi().subscribe((data:Array<ScanData>)=> {
      this.wifiList = data;
      this.showSpin = false;
    });
  }

  ngOnInit() {
    this.fetchData();
  }

  public refresh() {
    this.fetchData();
  }

  public getSignalStrength(quality : string) : string {
    let vals = quality.split('/');
    let strength = parseInt(vals[0]);
    let max = parseInt(vals[1]);
    let block = max / 6;
    strength = Math.min(Math.floor(strength / block),5);
    if (strength == 0){
      return 'wifi';
    } else {
      return 'wifi'.concat(strength.toString());
    }

  }

  private connectWifi(wifi:ScanData, password:string){
    this.rpiService.connectToSSID(wifi.ssid,wifi.mac,password).subscribe(r => {
      setTimeout((()=> {
        this.zone.run(()=>{
          this.router.navigate(['choice']);
        })
      }).bind(this),100);
    });

  }

  public selected(wifi : ScanData){
    console.log(wifi)
    if (wifi.encrypted){
      let dialogRef = this.dialog.open(PasswordDialogComponent,{data:{ssid:wifi.ssid}});
      dialogRef.afterClosed().subscribe((res:any) => {
        if (res.hasOwnProperty("password")){
          this.connectWifi(wifi,res.password);
        }
      })
    } else {
      this.connectWifi(wifi,undefined);
    }
  }

}

export interface ScanData {
  "mac": string;
  "ssid": string;
  "quality": string;
  "signal_level": number;
  "encrypted": boolean;
  "Channel": number;
}
