import express from "express"
import expressWs from "express-ws"
import expresssession from "express-session" 
import cors from "cors"

//algo()
// speichere gemischte Angebotsnehmer in die Datenbank

//sendeAllenDasGleiche()

//sendeAllenEtwasSpezifischesAusDerDatenBank(infoJeNachDem)


let datenbank = {
  "Lobby":{
    "LobbyID":[],
    "spielID":[],
    "wirt":[],
    "spieler":[[]],
    "lobby_kennwort":[],
    "name": []
  },
  "Lehrer":{
    "LehrerID":[],
    "benutzername":[],
    "email":[],
    "kennwort":[]
  },
  "Spiel":{
    "spiel_id":[],
    "runden_id":[]
  },
  "Runden":{
    "runden_id":[],
    "angebot":[]
  },
  "Angebote":{
    "angebot_id":[],
    "angebot_nehmer":[],
    "angebot_geber":[],
    "angebot_summe":[],
    "angebot_angenommen":[]
  },
  "Spieler":{
    "spieler_id":[]
  }
}
export async function startExpress() {
  var app = express();
  var session = expresssession();
  var expressWss = expressWs(app);
  //Wss 
  //Registrierungs Magie   /register
  app.use(cors()); 
  

  //Login magie   /login
  app.post("/login", (req, res) =>{
    //test zum hochladen
    res.send(["Anita", "123456"])
    
  })
  
  app.get("/login", (req, res) =>{
    //Nutzer schickt per post nutzername || email && passwort
    //Daten werden in der Datenbank überprüft
    //Wenn daten richtig:
    //express 
    //Eingeloggt Variabel
    
  })

  //jedes mal wenn wir vom Frontend eine Anfrage für eine Neue Lobby erhalten, /lobby/create   -----
  app.post("/lobby/create", (req, res) => {
    

    //wird kontrolliert ob der Nutzer bereits eine lobby offen hat:
    //hole alle nutzer
    
      //Wenn ja 
      //wird die alte Lobby aus der Datenbank gelöscht



    //es wird ein neuer Lobbycode generiert
    let newCode = Math.floor(Math.random() * 90000) + 10000
    //und in der Datenbank gespeichert

    datenbank.Lobby.lobby_kennwort.push(newCode)
    console.log(JSON.stringify(newCode))
    //sende den generierten lobbycode an das frontend
    res.send(JSON.stringify(newCode))
  })
  //
  
  // Hier werden Daten aus der Datenbank exportiert (heruntergeladen) /lobby/:00000/export   -----
  // Speichere den Code der Anfrage in eine Variabel  
  // Datenbank nach Code durchsuchen 
  // Code Existiert nicht:
    // Wird 404 geschickt
  // ist der Code vorhanden:
    // hohle daten aus der datenbank mit dem Lobbycode
    // lade es zum nutzer so

   var wss = expressWss.getWss('/lobby/:lobby');
  // Das ist ein Websocket/Lobbie   /lobby/:00000   -----
  app.ws('/lobby/:lobby', function(ws, req) {
    console.log(req.params.lobby)
    //const lobbyCodeFromUser = req.params.lobby
    ws.on('message', function(msg) {
      console.log(msg);
      wss.clients.forEach(function (client) {
        client.send(JSON.stringify({
          type: 'player_count',
          data: wss.clients.size-1
        }))
      });
    });
    
    // if nachricht == "spiel startet":
      // Alle aus der Lobby erhalten Signal: "Spiel Startet"
      // nächste runde in die datenbank
    //place_offer answer_offer

    ws.on("message", function(msg) {
      switch(msg.type){
        case "start_round":
          client.send(JSON.stringify({
            type: "place_offer",
            data: {
              game:datenbank.Lobby.LobbyID,
              round: datenbank.Runden.runden_id,
              class: datenbank.Lobby.name,
            }
          }))
          break
        case "start_game":
          client.send(JSON.stringify({
            type: "place_offer",
            data: {
              game:datenbank.Lobby.LobbyID,
              round: datenbank.Runden.runden_id,
              class: datenbank.Lobby.name,
            }
          }))
          break
        case "offer":
          client.send(JSON.stringify({
            type: "wait",
            data: {}
          }))
          break
        case "accept_offer":
          client.send(JSON.stringify({
            type: "wait",
            data: {}
          }))
          break
        case "decline_offer":
          client.send(JSON.stringify({
            type: "wait",
            data: {}
          }))
          break
        
        
            
        
        
      }
    })

    console.log('socket', req.testing);      
  })

  
  
  // Speichere den Code der Anfrage in eine Variabel  
    // wenn Nutzer nicht eingeloggt:
      // trage Schüler in die Datenbank ein
      // schicke anzahl Spieler in Lobby an den Lehrer
    // else
      // trage Lehrer in die Datenbank ein
    //
    //
    // warte auf nachricht



      //  
      //  
      // if nachricht == "angebot fertig"
        // Angebot Nehmer/Geber zufällige mischen: algo()
        // Alle aus der Lobby erhalten ein Angebot welche vom algo eingeteilt wurden
        // 
        //  
      // if nachricht == "nachfrage fertig":
        // Alle aus der Lobby erhalten Signal: "Angenommen" || "Abgelehnt" aus der Datenbank
        //
      // if nachricht == "nächste runde":
        // Alle aus der Lobby erhalten Signal: "nächste Runde"
        // nächste runde in die datenbank 
        //
      // if nachricht == "nächstes spiel":
        // Alle aus der Lobby erhalten Signal: "nächstes Spiel"
        // neue runde und neues Spiel werden in die Datenbank eingefügt
        //
      // if nachricht == "lobby schliessen":
        // SOLLTEN ALLE DATEN AUS DER DATENBANK GELÖSCHT WERDEN!?!?!?
        //
        //
        //
      // if nachricht == "angebot :00"
        // in der datenbank wird summe und angebotgeber gespeichert
        // lehrer update schicken
        //
      // if nachricht == "nachfrage :0"
        // in der datenbank wird angenommen gespeichert
        // lehrer update schicken
        //
        //
      





  // 
  
  
  return app.listen(8080);
}

startExpress()


// app.ws('/lobby', function (ws, req) {
//   console.log("object");
  
//   ws.send("momomo");
  
  

//   ws.on('message', function (msg) {
//     console.log(ws);
//     console.log(msg);
//     ws.send("s");


//   });
// });