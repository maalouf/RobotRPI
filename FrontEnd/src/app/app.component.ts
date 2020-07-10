import { Component,OnInit } from '@angular/core';
import {SvgIconLoadingService} from 'share/svg-icon-loading.service'
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit{
  private iconToLoad : Array<string> = ['wifi','wifi1','wifi2','wifi3','wifi4','wifi5'];
  private folderIcon : string = '../assets/icons'
  title = 'robotFront';
  constructor(private iconService : SvgIconLoadingService) {}

  ngOnInit() {
    this.iconService.loadIconsArray(this.iconToLoad,this.folderIcon);
  }
}
