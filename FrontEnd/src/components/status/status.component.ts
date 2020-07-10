import { Component, OnInit,OnDestroy } from '@angular/core';
import {SystemStatus, SystemStatusService} from 'share/system-status.service';

@Component({
  selector: 'app-status',
  templateUrl: './status.component.html',
  styleUrls: ['./status.component.css']
})
export class StatusComponent implements OnInit ,OnDestroy{
  status: SystemStatus;
  private subs : Array<any>;
  battery : number;
  constructor(private systemStatus : SystemStatusService) { }
  ngOnDestroy(): void {
    this.subs.forEach(x => x.unsubscribe());
  }

  ngOnInit(): void {
    this.subs = new Array<any>();
    this.battery = 0;
    this.subs.push(this.systemStatus.onSystemChangeIP().subscribe(stat => {
      this.status = stat;
    }));
    this.subs.push(this.systemStatus.onsystemChanheInfo().subscribe(stat => {
      this.status = stat;
      this.battery = ((stat.battery - 7) * 100)/4.1;
    }));
  }

}
