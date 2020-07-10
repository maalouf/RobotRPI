import {Server} from './server'
import {WifiController} from './API/wifiControl'
import {CameraStream} from './camera/CameraStream'
import {ControlPi} from "./services/controlPi"

export class MainApp {
  controller : WifiController;
  private piComms : ControlPi;

  constructor(){
    this.controller = new WifiController();
    this.piComms = ControlPi.getInstance();

  }

  startServices(){
    this.controller.is_wifi_enabled().then(resWifi => {//{enabled,isAp,info};
      if (resWifi.enabled){
        this.startServer();
        this.piComms.clearAllLCD();
        this.piComms.sendText("System Ready.",2);
        this.piComms.sendText((resWifi.isAp)?"Access Point Mode.":
        "Wifi Mode enabled",4);
        this.piComms.sendText(resWifi.info.ip.local,6);
      } else {
        this.controller.enable_ap_mode().then(r => {
          if(r){
            this.piComms.sendText("Rebooting for Access Point... PLZ standBy.",3);
            this.controller.rebootSystem();
          }
        })
      }
    });
  }

  startServer(){
    let server = new Server(8080); // now we can handle the ref
    server.connect();
    let stream = new CameraStream();
    stream.start();
    console.log('ok')
  }

}

let app = new MainApp();
app.startServices();
