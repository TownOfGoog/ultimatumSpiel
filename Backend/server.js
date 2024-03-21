

import express from "express"
import expressWs from "express-ws"
import expresssession from "express-session" 


//algo()
// speichere gemischte Angebotsnehmer in die Datenbank

//sendeAllenDasGleiche()

//sendeAllenEtwasSpezifischesAusDerDatenBank(infoJeNachDem)


let datenbank = {
  "Lobby":{
    "LobbyID":["1"],
    "spielID":[1, 2],
    "wirt":["1"],
    "spieler":["1, 2"],
    "lobby_kennwort":["00000"],
    "name": ["I3a"]
  },
  "Lehrer":{
    "LehrerID":["1"],
    "benutzername":["Anita Metzger"],
    "email":["@"],
    "kennwort":["123456"]
  },
  "Spiel":{
    "spiel_id":["1"],
    "runden_id":["1"]
  },
  "Runden":{
    "runden_id":["1"],
    "angebot":["1"]
  },
  "Angebote":{
    "angebot_id":["1"],
    "angebot_nehmer":["1"],
    "angebot_geber":["2"],
    "angebot_summe":["10"],
    "angebot_angenommen":["TRUE"]
  },
  "Spieler":{
    "spieler_id":[1, 2]
  }
}
export async function startExpress() {
  var session = expresssession()
  var app = express();
  expressWs(app);
  //Registrierungs Magie   /register
  

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
    
    
    app.get("/lobby/create", (request, response) =>{
      var lobbies = request.query
  })

  var num = ["00000", "99999", "93845", "99303"]
  // Das ist ein Websocket/Lobbie   /lobby/:00000   -----
  app.ws('/lobby/', function(ws, req) {
    ws.on('message', function(msg) {
      console.log(msg);
    });
    ws.send("OOOOOOOOOO")
    
    if (req.includes(lobbies)){
      //sag backend er soll Nutzer umleiten
      
    }
    

  });
  
  
  // Speichere den Code der Anfrage in eine Variabel  
  
  app.ws('/lobby/'+num, function(ws, req) {
    ws.on('message', function(msg) {
      console.log(msg);
    });
    console.log('socket AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA', req.testing);
    ws.send("AAAAAAAAAAAAAAAAAAAAAA")
  });
  
  // wenn Nutzer nicht eingeloggt:
      // trage Schüler in die Datenbank ein
      // schicke anzahl Spieler in Lobby an den Lehrer
    // else
      // trage Lehrer in die Datenbank ein
    //
    //
    // warte auf nachricht
    // if nachricht == "spiel startet":
      // Alle aus der Lobby erhalten Signal: "Spiel Startet"
      // nächste runde in die datenbank



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