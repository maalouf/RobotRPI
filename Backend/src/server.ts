import bodyParser from "body-parser";
import express from "express";
import cors from "cors";
import methodOverride from "method-override";
import https from 'https';
import {readFileSync} from 'fs';
import {RoutingController} from './routers/routingController'
import {SocketApi} from './API/SocketApi';
import path from 'path'

export class Server {
  public app : express.Application;
  private sslOptions : {key:Buffer,cert:Buffer};
  private port : number;
  private controllers : RoutingController;

  public getPort() : number {
    return this.port;
  }

  constructor(port:number){
    this.port = port;
    this.app = express();
    let sslPathKey = path.join(__dirname,'ssl','server.key');
    let sslPathCert = path.join(__dirname,'ssl','server.cert');
    this.sslOptions =
    {key: readFileSync(sslPathKey),
     cert: readFileSync(sslPathCert)};
    this.config();
    this.routes();
  }

  connect(){
    let server = https.createServer(this.sslOptions,this.app);
    new SocketApi(server);
    server.listen(this.port,()=> {
      console.log("Server is up and listening to ", this.port);
    });
  }

  private routes(){
    this.controllers = new RoutingController(this.app);
    this.controllers.initControllers();
  }

  private config(){
    this.app.use(cors());
    this.app.use(bodyParser.urlencoded({
        extended: true
    }));
    // parse json
    this.app.use(bodyParser.json());
    // parse text/plain
    this.app.use(bodyParser.text({
        type: 'text/plain'
    }));
    this.app.use(bodyParser.raw());
    this.app.use(methodOverride('X-HTTP-Method-Override'));
    this.app.use(function(err: any, _req: express.Request, _res: express.Response,
    next: express.NextFunction) {
     err.status = 404;
     next(err);
    });
    this.app.use(express.static("dist/www"));
  }
}
