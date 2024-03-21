import { WebSocketServer } from 'ws';

export function startserver(){
const wss = new WebSocketServer({ port: 8080, path: "/lobby" });


wss.on('connection', function connection(ws) {
  ws.on('error', console.error);





  ws.send('momomo');

    ws.on('message', function message(data) {
      console.log('received: %s', data);
      ws.send("s")

      
    });
});

return wss
}

