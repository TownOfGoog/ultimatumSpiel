import { startExpress } from "./server.js";
import express from "express"
import expressWs from "express-ws"
import WebSocket from "ws"
import { conditionWait } from "./util.js";

var wss
//wartet bis der server existiert
wss = await startExpress()

//macht neuen websocket der client heisst
var client = new WebSocket("ws://localhost:8080/lobby")
//erstellt testdatenvariabel
var testData
//wartet auf websocket
await conditionWait(client, client.OPEN)
console.log(client.readyState)

//client sendet an server "ho"
client.send("ho")

//client fängt an zu hören
client.onmessage = (event) => {
    //wenn client etwas gehört dann passiert:
    console.log(2)
    //speichert die variabeln
    testData = event.data
    //schliesst das client
    client.close()
    //schliesst den server
    wss.close()
    
}


//wartet auf schliessen 
await conditionWait(client, client.CLOSED)

 







test('first test', () => {
    expect(testData).toBe('s');
  });


