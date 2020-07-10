import { Component, OnInit,NgZone,ViewChild, ElementRef,OnDestroy } from '@angular/core';
import {Router} from '@angular/router';
import {SystemStatusService, SystemStatus} from "share/system-status.service"
@Component({
  selector: 'app-home-page',
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.css']
})
export class HomePageComponent implements OnInit,OnDestroy {
  srcImg = "http://192.168.0.16:4000/stream.jpg";
  isInControle : boolean;
  private subs: any;
  inFullScreen : boolean;
  status : SystemStatus;
  battery : number;
  showMenu: boolean;
@ViewChild('fullscreenContainer',{static:false}) fullscreenContainer : ElementRef;
  constructor(private router:Router,private statusService : SystemStatusService) { }
  ngOnDestroy(): void {
    if (this.subs) this.subs.unsubscribe();
  }

  ngOnInit(): void {
    this.inFullScreen = false;
    this.subs = this.statusService.onSystemChangeIP().subscribe(data => {
      if (data.ip !== undefined){
        this.srcImg = "http://"+data.ip+":4000/stream.jpg";
      }
    });
    this.statusService.onsystemChanheInfo().subscribe(data => {
      this.status = data;
      this.battery = ((data.battery - 7) * 100)/4.1;
    })
  }

  fullscreen(){
    let element = this.fullscreenContainer.nativeElement;
    if (element.classList.contains('fullscreen')) {
      return;
    }
    let requestFullScreen = element.requestFullscreen
    || element.msRequestFullscreen
    || element.mozRequestFullScreen
    || element.webkitRequestFullscreen;

    if (requestFullScreen) {
      requestFullScreen.call(element);
    }
    element.classList.add("fullscreen");
    this.inFullScreen = true;
  }

  exitFullscreen() {
    let doc = <any>document;
    let element = this.fullscreenContainer.nativeElement;
    if(!element.classList.contains('fullscreen')) {
      return;
    }
    let exitFullscreen = doc.exitFullscreen
    || doc.webkitExitFullscreen
    || doc.mozCancelFullScreen
    || doc.msExitFullscreen;

    if (exitFullscreen) {
      exitFullscreen.call(doc);
    }
    // Failover for IOS
    element.classList.remove("fullscreen");
    this.inFullScreen = false;
  }



}
