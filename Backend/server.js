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
    "spielID":[[]],
    "wirt":[],
    "spieler_id":[[]],
    "lobby_kennwort":[],
    "name": []
  },
  "Lehrer":{
    "LehrerID":[0],
    "benutzername":["Anita"],
    "email":["@"],
    "kennwort":["123456"],
    "websocket":[]
  },
  "Spiel":{
    "spiel_id":[],
    "runden_id":[[]]
  },
  "Runden":{
    "runden_id":[],
    "angebot_id":[[]]
  },
  "Angebote":{
    "angebot_id":[],
    "angebot_nehmer":[],
    "angebot_geber":[],
    "angebot_summe":[],
    "angebot_angenommen":[]
  },
  "Spieler":{
    "spieler_id":[],
    "websocket":[]
  }
}
export async function startExpress() {
  var app = express();
  var session = expresssession();
  var expressWss = expressWs(app);
  //Wss 
  //Registrierungs Magie   /register
  app.use(cors()); 
  

  app.use(express.json());


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

    //sende den generierten lobbycode an das frontend
    res.send(JSON.stringify(newCode))
    datenbank.Lobby.LobbyID[datenbank.Lobby.LobbyID.length] = datenbank.Lobby.LobbyID.length
    datenbank.Lobby.wirt.push(datenbank.Lehrer.LehrerID[0])
    datenbank.Lobby.spieler_id.push([])
    console.log(datenbank.Lobby)
    datenbank.Lobby.spielID.push([])
    datenbank.Spiel.runden_id.push([])
    counter = 0
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
let counter = 0
   var wss = expressWss.getWss('/lobby/:lobby');
  // Das ist ein Websocket/Lobbie   /lobby/:00000   -----
  app.ws('/lobby/:lobby', function(ws, req) {
    let lobbycode
    let runde
    let spieler_id
    counter = counter +1
    //const lobbyCodeFromUser = req.params.lobbycon
    ws.on('message', function(msg) {
      
      if(datenbank.Lobby.lobby_kennwort.includes(parseInt(req.params.lobby))){
        lobbycode = datenbank.Lobby.LobbyID[datenbank.Lobby.lobby_kennwort.indexOf(parseInt(req.params.lobby))]
      } else {


        ws.close()
      }
      
      if(counter == 1){
        datenbank.Lehrer.websocket.push(ws)
      }
      if(ws !== datenbank.Lehrer.websocket[lobbycode]){
        console.log("aaaaaaaaaaaaaaaaaaaaaaaaaaaaaa")
        let spieler = datenbank.Spieler.spieler_id.length
        datenbank.Spieler.spieler_id.push(spieler)
        spieler_id=spieler
        datenbank.Spieler.websocket.push(ws)
        datenbank.Lobby.spieler_id[lobbycode].push(spieler)
        ws.send(JSON.stringify({
          type: "wait",
          data: {}
        }))
        datenbank.Lehrer.websocket[lobbycode].send(JSON.stringify({
          type: 'new_player',
        }))
        
      }
      
      ;
    });
    
    // if nachricht == "spiel startet":
      // Alle aus der Lobby erhalten Signal: "Spiel Startet"
      // nächste runde in die datenbank
    //place_offer answer_offer
    
    let items
    ws.on("message", function(msg) {
      console.log(msg)  


      let data = JSON.parse(msg)
      switch(data.type){
        case "start_round":
          datenbank.Lehrer.websocket[0].send(JSON.stringify({
            type: "place_offer",
            data: {
              game:datenbank.Lobby.LobbyID,
              round: datenbank.Runden.runden_id,
              class: datenbank.Lobby.name,
            }
          }))
          break
        case "start_game":
          console.log(lobbycode)
          let spiel_id = datenbank.Spiel.spiel_id.length
          datenbank.Spiel.spiel_id.push(spiel_id)
          console.log(spiel_id)
          datenbank.Lobby.spielID[lobbycode].push(spiel_id)
          let runden = datenbank.Runden.runden_id.length
          datenbank.Runden.runden_id.push(runden)
          runde = runden
          datenbank.Spiel.runden_id[lobbycode].push(runden)
          datenbank.Runden.angebot_id.push([])

          items = datenbank.Lobby.spieler_id[lobbycode]

          for (var i = 0; i < items.length; i++) {
            var n = items[i];
          datenbank.Spieler.websocket[n].send(JSON.stringify({ //wird an den spieler geschickt oder
            type: "place_offer",
            data: {
              game:datenbank.Lobby.LobbyID,
              round: datenbank.Spiel.runden_id[0],
              class: datenbank.Lobby.name,
            }
          }))}
          break
        case "offer":
          console.log("WWWWWWWWWWWWWWWWWWWWWWWW")
          datenbank.Runden.angebot_id.push(datenbank.Angebote.angebot_id.length)
          datenbank.Angebote.angebot_id.push(datenbank.Angebote.angebot_id.length)
          datenbank.Angebote.angebot_summe.push(JSON.parse(msg).data.amount)
          datenbank.Angebote.angebot_geber.push(spieler_id)
          console.log(datenbank.Lobby.spieler_id.length!=datenbank.Runden.angebot_id.length)
          
        items = datenbank.Lobby.spieler_id[lobbycode]
        if(datenbank.Lobby.spieler_id.length!=datenbank.Runden.angebot_id.length-1){
             
          ws.send(JSON.stringify({
            type: "wait",
            data: {}

            
          }))
          datenbank.Lehrer.websocket[lobbycode].send(JSON.stringify({
            type: 'new_offer',
          }))}else{

          ws.send()
            
            for (var i = 0; i < items.length; i++) {
              var n = items[i];
            datenbank.Spieler.websocket[n].send(JSON.stringify({ //wird an den spieler geschickt oder
              type: "answer_offer",
              data: {
                game:datenbank.Lobby.LobbyID,
                round: datenbank.Spiel.runden_id[0],
                class: datenbank.Lobby.name,
              }
            }))}

            //schicke jedem message.type = answer_offer
          }
          break
        case "accept_offer":
          if(datenbank.Lobby.spieler.length!=datenbank.Angebote.angebot_angenommen.length){
          clients.send(JSON.stringify({
            type: "wait",
            data: {}
          }))}else{
            //schicke jedem message.type =
          }
          break
        case "decline_offer":
          if(datenbank.Lobby.spieler.length!=datenbank.Angebote.angebot_angenommen.length){
          clients.send(JSON.stringify({
            type: "wait",
            data: {}
          }))}else{
            //schicke jedem message.type =
          }
          break
        
        
            
        
        
      }
    })

        
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