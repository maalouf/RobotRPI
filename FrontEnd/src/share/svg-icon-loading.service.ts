/**
 * @Author: maalouf
 * @Date:   2019-09-23T11:47:23+02:00
 * @Last modified by:   maalouf
 * @Last modified time: 2019-09-23T14:09:59+02:00
 */



import { Injectable } from '@angular/core';
import {MatIconRegistry} from '@angular/material/icon'
import {DomSanitizer} from '@angular/platform-browser'
@Injectable({
  providedIn: 'root'
})
export class SvgIconLoadingService {
  private loadedIcons : Array<string>;
  constructor(private iconRegistry : MatIconRegistry, private sanitizer : DomSanitizer) {
    this.loadedIcons = new Array<string>();
  }

  public loadIcon(name:string,url:string){
    this.iconRegistry.addSvgIcon(name,url);
    this.loadedIcons.push(name);
  }

  public loadIconsArray(icons : Array<string>,folder: string){

    icons.forEach( icon => {
      let path = folder.concat('/',icon,'.svg');
      this.loadedIcons.push(icon);
      this.iconRegistry.addSvgIcon(icon,this.sanitizer.bypassSecurityTrustResourceUrl(path));
    })
  }

  public isSvgLoaded(icon: string): boolean {
    return this.loadedIcons.includes(icon);
  }
}
