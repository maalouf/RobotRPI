import {exec} from "child_process";
import fs from 'fs'
import path from 'path'
import {ControlPi} from "../services/controlPi"
export interface ScanData {
  "mac": string;
  "ssid": string;
  "quality": string;
  "signal_level": number;
  "encrypted": boolean;
  "Channel": number;
}

export interface NetworkState {
  ip: string;
  isAP : boolean;
}

export class WifiController {

  accessPoint = {
    "wifi_interface": "wlan0",
    "ssid": "robot-ap",
    "passphrase": "configPassword",
    "domain": "rpi.config",
    "ip_addr": "192.168.44.1",
    "netmask": "255.255.255.0",
    "subnet_ip": "192.168.44.0",
    "broadcast_address": "192.168.44.255",
    "start": "192.168.44.10",
    "end": "192.168.44.50"
  }

  private fields = {
    'mac' : /^Cell \d+ - Address: (.*)/,
    'ssid' : /^ESSID:"(.*)"/,
    'quality' : /Quality(?:=|\:)([^\s]+)/,
    'signal_level' : /Signal level(?:=|\:)([^\s]+)/,
    "encrypted":       /Encryption key:(on)/,
    "Channel":         /Channel:(\d+)/
  };
  private piComms : ControlPi;

  private assetsPath = path.join(__dirname,'..','assets');
  constructor(){
    this.piComms = ControlPi.getInstance();
  }

  private executeCommand(cmd : string) : Promise<string>{
    return new Promise<string>((resolve,reject) => {
      exec(cmd,(error, stdout, _stderr)=> {
        if (error) reject(error);
        resolve(stdout);
      })
    });
  }


  private templateReplace(text:string, context: any): string {
    let replacement = text;
    Object.keys(context).forEach(arg => {
      let reg = new RegExp('{{\\s?'+arg+'\\s?}}','g');
      replacement = replacement.replace(reg,context[arg]);
    });
    return replacement;
  }

  private copyTo(from: string, to: string): Promise<string>{
    return this.executeCommand("sudo cp -rf ".concat(from,' ',to));
  }

   private async generateTemplate(template_path:string, file_name:string, context:any) {
    let file_txt = fs.readFileSync(template_path, {encoding: "utf8"});
    let template = this.templateReplace(file_txt,context);
    fs.writeFileSync(this.assetsPath + "/templates/tempo.template", template);
    await this.copyTo(this.assetsPath + "/templates/tempo.template",file_name);
  }

  private restartNetwork(): Promise<boolean> {
    return new Promise<boolean>((resolve,_reject)=> {
      exec("sudo ifdown wlan0",(err)=> {
        if (err) resolve(false);
        exec("sudo ifup wlan0",(err2)=> {
          if (err2) resolve(false);
          resolve(true);
        })
      })
    })
  }

/********************************************************************/


  private iwlistParse(str:string): Array<ScanData> {
    let _out = str.replace(/^\s+/mg, '');
    let cells = new Array<any>();
    let info = {};
    _out.split('\n').forEach(line => {
        line = line.trim();
        if (line.length !== 0 && !line.match("Scan completed :$")
        && !line.match("Interface doesn't support scanning.$")){
          if (line.match(this.fields.mac)) {
              if (Object.keys(info).length > 0) cells.push(info);
              info = {};
          }
          for (let field in this.fields) {
            if (line.match(this.fields[field])) {
              let lineData = (this.fields[field].exec(line)[1]).trim();
              switch(field){
                case "signal_level":
                case "Channel":{
                  info[field] = parseInt(lineData);
                  break;
                }
                case "encrypted":{
                  info[field] = lineData == 'on';
                  break;
                }
                default: {
                  info[field] = lineData;
                }
              }
            }
          }
        }
      });
      cells.push(info);
    return cells;
  }

  public scanWifi() : Promise<Array<any>> {
    return new Promise<Array<any>>((resolve,reject)=> {
      exec("sudo iwlist scan",(error, stdout, _stderr) => {
        if (error) reject(error);
        let output = this.iwlistParse(stdout);
        resolve(output);
      });
    });
  }

  get_wifi_info(): Promise<any> {
    return this.get_interface_info('wlan0')
  }

  async getWifiSignal() : Promise<number> {
    let res = await this.executeCommand("sudo iwconfig wlan0");
    let reg = /Link Quality=\d+\/70/g;
    let mat = res.match(reg);
    let numb = mat[0].substring(13,mat[0].indexOf('/70'));
    return (parseInt(numb) * 10)/7;
  }

  async get_interface_info(iface:string) {
    const res = await this.executeCommand("sudo ip -j addr");
    let data = JSON.parse(res).find((x:any) => x.ifname == iface);
    let last_info = { 'name': iface, 'mac': undefined, ip: undefined };
    if (data !== null && data !== undefined) {
      let netInfo = data.addr_info.find((x_1:any) => x_1.family == 'inet');
      last_info = { 'name': data.ifname, 'mac': data.address, ip: netInfo };
    }
    return (last_info);
  }

  rebootSystem(){
    this.executeCommand('sudo systemctl reboot').then(() => {});
  }

  async is_wifi_enabled(): Promise<any> {
    let result = await this.get_interface_info('wlan0');
    if (result.ip == undefined){
      return {enabled: false,info:undefined};
    } else {
      return {enabled: true,isAp:(result.ip.local == this.accessPoint.ip_addr),info:result};
    }
  }

    async controleApServices(state : boolean) : Promise<boolean> {
      if (state == true){
        await this.executeCommand("sudo systemctl enable hostapd");
        await this.executeCommand("sudo systemctl start hostapd");
        await this.executeCommand("sudo systemctl enable udhcpd");
        await this.executeCommand("sudo systemctl start udhcpd");
      } else {
        await this.executeCommand("sudo systemctl stop udhcpd");
        await this.executeCommand("sudo systemctl disable udhcpd");
        await this.executeCommand("sudo systemctl stop hostapd");
        await this.executeCommand("sudo systemctl disable hostapd");
      }
      return true;
    }

    // Enables the accesspoint w/ bcast_ssid. This assumes that both
    async enable_ap_mode(): Promise<boolean> {
      this.piComms.clearAllLCD();
      this.piComms.sendText("ACCESS POINT Mode ENABLED...",2);
      let context = Object.assign({},this.accessPoint);
      context["enable_ap"] = true;
      await this.generateTemplate(this.assetsPath + "/etc/network/interfaces.ap.template",
      "/etc/network/interfaces",context);

      await this.generateTemplate(this.assetsPath + "/etc/hostapd/hostapd.conf.template",
      "/etc/hostapd/hostapd.conf",context);

      await this.generateTemplate(this.assetsPath + "/etc/hostapd/hostapd.template",
      "/etc/default/hostapd",context);

      await this.generateTemplate(this.assetsPath + "/etc/dhcp/udhcpd.conf",
      "/etc/udhcpd.conf",context);
      this.piComms.sendText("Enabling Services..",4);
      await this.controleApServices(true);
      this.piComms.sendText("AP OK ... REBOOT",6);
      return true;
    }

    async enableWifi(ssid:string, password: string) : Promise<boolean> {
      this.piComms.clearAllLCD();
      this.piComms.sendText("Connecting to WIFI...",2);
      this.piComms.sendText("SSID: "+ssid,4);
      let context = {wifi_ssid: ssid, wifi_passcode: password };
      await this.controleApServices(false);
      await this.generateTemplate(this.assetsPath + "/etc/network/interfaces.wifi.template",
      "/etc/network/interfaces",context);
      let rest = await this.restartNetwork();
      this.reportStatus();
      return rest;
    }

    async getBattery(): Promise<number> {
      let sval = await this.piComms.getBattery();
      let val = sval.substring(0,sval.length - 1);
      return parseFloat(val);
    }

    private reportStatus(){
      this.is_wifi_enabled().then(resWifi => {//{enabled,isAp,info};
        this.piComms.sendText("System Ready.",5);
        this.piComms.sendText((resWifi.isAp)?"Access Point Mode":
        "Wifi Mode enabled",6);
        this.piComms.sendText(resWifi.info.ip.local,7);
      });
    }

    shutDown(){
      this.executeCommand("sudo shutdown now").then(()=>{});
    }

}
