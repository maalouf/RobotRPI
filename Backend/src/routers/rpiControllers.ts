import {Controller} from './Controller';
import {RPIApi} from '../API/RPIApi';
import {Application} from 'express';

export class RPIController extends Controller {
  private rpiApi : RPIApi;
  constructor(app: Application){
    super(app)
  };
  initiate(){
    this.rpiApi = new RPIApi();
    this.buildRoutes();
  }

  private buildRoutes(){
    this.app.get("/scanWifi",(_request,result)=> {
      this.rpiApi.scanWifi().then(data => {
          result.json(data);
      })
    });

    this.app.post("/setWifi",(request,result)=> {
      let params = request.body; //{"ssid":ssid,"mac":mac,"password":password}
      console.log(params)
      this.rpiApi.setWifi(params.ssid,params.password);
      result.json({status:true});
    });

    this.app.get('/setAP',(_req,result)=> {
      this.rpiApi.setAPP();
      result.json({status:true});
    });

    this.app.get('/getSignal',(_req,result)=> {
      this.rpiApi.getSignal().then(sg => {
        result.json({signal:sg});
      })
    });

    this.app.get('/getBattery',(_req,result)=> {
      result.json({batt:this.rpiApi.getBattery()});
    });

  }
}
