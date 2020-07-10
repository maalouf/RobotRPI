import {Server} from "https";
import socketIo from "socket.io";
import {RobotController} from './RobotController'

export class SocketApi {
  private io : socketIo.Server;
  private robotControl : RobotController;
  private connectionAPI : socketIo.Namespace;
  private robotAPI: socketIo.Namespace;

  constructor(server: Server){
    this.io = socketIo(server);
    this.robotControl = new RobotController();
    this.connectionAPI = this.io.of('/connectStat');
    this.robotAPI = this.io.of('/robot');
    this.setEvents();
  }

  setEvents(){

    this.robotAPI.on('connection', (socket:any) => {
        socket.on("gamepad",(data:any) => {
          if(data.id == "buttonsChanged"){
            this.robotControl.handleButtonsClick(data.data);
          }
          if (data.id == "axis"){
            this.robotControl.handeAxies(data.data);
          }
        });
        socket.on('disconnect',() => {
          //this.sharedServiceInstance.setSessionActive(false);
        });
    });
    this.connectionAPI.on('connection',(_socket:any)=> {
      console.log("ok this one ")
    })
  }
}
