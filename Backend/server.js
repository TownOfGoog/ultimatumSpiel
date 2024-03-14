

import express from "express"
import expressWs from "express-ws"


function funk(goog) {
  console.log(goog);
}




export async function startExpress() {
  var app = express();
  expressWs(app);

  app.get('/', function (req, res) {
    res.send("Hello world!sdfaskljöfasdkjlf");
  });





  app.ws('/lobby', function (ws, req) {
    console.log("object");

    ws.send("momomo");



    ws.on('message', function (msg) {
      console.log(ws);
      console.log(msg);
      ws.send("s");


    });
  });


  return app.listen(8080);
}

