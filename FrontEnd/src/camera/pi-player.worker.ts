///// <reference lib="webworker" />
import {WSAvcPlayer} from 'camera/player/wsacPlayer'
var player = {offscreenCanvas:undefined,player:undefined};
addEventListener('message', ({ data }) => {
  switch(data.cmd){
          case 'init':
              player.offscreenCanvas = data.canvas;
              player.player = new WSAvcPlayer(player.offscreenCanvas);
              player.player.onDataDecoded().subscribe((data:any) => {
                postMessage({type:'data','data':data},[data.buffer.buffer]);
              });
              player.player.onMessage().subscribe((data:any)=> {
                postMessage({type:'msg',data:data});
              })
              break;
          case 'play':
              player.player.playStream();
              break;
          case 'stop':
              player.player.stopStream();
              break;
          case 'connect':
              player.player.connect(data.url);
              break;
          case 'disconnect':
              player.player.disconnect();
              break;
          default:{};
      }

});
