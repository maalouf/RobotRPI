import {WifiController} from './wifiControl';
import {ControlPi} from '../services/controlPi'
export class RPIApi{
  private wifiController : WifiController;
  private localBattery : number;
  constructor(){
    this.wifiController = new WifiController();
    this.controlBattery();
  }

  private controlBattery(){
    this.wifiController.getBattery().then(data => {
      this.localBattery = data;
      if (data <= 7){
        this.handleLowBattery();
      } else {
        setTimeout(this.controlBattery.bind(this),60000);
      }
    });
  }

  private handleLowBattery() {
    let conpi = ControlPi.getInstance();
    conpi.clearAllLCD();
    conpi.sendText("....DANGER....",3);
    conpi.sendText("LOW POWER...",4);
    conpi.sendText("EMMERGENCY SHUTDOWN!",5);
    conpi.initializeHand().then(()=> {
      this.wifiController.shutDown();
    })
  }

  scanWifi(): Promise<Array<any>> {
    return this.wifiController.scanWifi();
  }

  setWifi(ssid:string,pass:string){
    this.wifiController.enableWifi(ssid,pass).then(r => {
      console.log("AP set ",r)
    })
  }

  getSignal() : Promise<number> {
    return this.wifiController.getWifiSignal();
  }

  getBattery() {
    return this.localBattery;
  }

  setAPP(){
    this.wifiController.enable_ap_mode().then(r => {
      this.wifiController.rebootSystem();
      console.log("AP set ",r)
    })
  }



}
