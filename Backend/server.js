import express from "express"
import expressWs from "express-ws"
import expresssession from "express-session" 
import cors from "cors"

//algo()
// speichere gemischte Angebotsnehmer in die Datenbank

//sendeAllenDasGleiche()

//sendeAllenEtwasSpezifischesAusDerDatenBank(infoJeNachDem)

function shuffle(array) {
  let n = array[0]
  array.shift()
  array.push(n)
  return array
}

let datenbank = {
  "Lobby":{
    "LobbyID":[],
    "spielID":[[]],
    "wirt":[],
    "spieler_id":[[]],
    "lobby_kennwort":[],
    "name": [],
    "host_websocket":[]
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
  let counter = 0

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
    console.log(counter,"jijiojojojokjlkghierwhgfiiugfdzushfbkdsgzuf")
  })
  
  
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
    let lobbycode
    let runde
    let spieler_id
    counter = counter +1
    //const lobbyCodeFromUser = req.params.lobbycon
    
    if(datenbank.Lobby.lobby_kennwort.includes(parseInt(req.params.lobby))){
      lobbycode = datenbank.Lobby.lobby_kennwort.indexOf(parseInt(req.params.lobby))
      console.log(lobbycode,"333333333333333333333333")
    } else {


      ws.close()
      return
    }
    console.log(counter)
    if(counter == 1){
      datenbank.Lehrer.websocket.push(ws)
      datenbank.Lobby.host_websocket.push(ws)
    }
    console.log(datenbank.Lehrer.websocket.length)
    console.log(ws !== datenbank.Lehrer.websocket[datenbank.Lehrer.websocket.length-1])
    
    if(ws !== datenbank.Lobby.host_websocket[lobbycode]){
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

    // if nachricht == "spiel startet":
      // Alle aus der Lobby erhalten Signal: "Spiel Startet"
      // nächste runde in die datenbank
    //place_offer answer_offer
    
    let items
    ws.on("message", function(msg) {
      console.log(msg)  
      runde = datenbank.Runden.runden_id.length

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
          console.log(runde, "12345678765432123456787654345678")
          console.log(lobbycode)
          let spiel_id = datenbank.Spiel.spiel_id.length
          datenbank.Spiel.spiel_id.push(spiel_id)
          console.log(spiel_id)
          datenbank.Lobby.spielID[lobbycode].push(spiel_id)
          datenbank.Runden.runden_id.push(runde)
          datenbank.Spiel.runden_id[lobbycode].push(runde)
          console.log(datenbank.Spiel.runden_id[lobbycode],"ijjijijijijijijiiiijiji")
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
console.log(datenbank.Lehrer.websocket[datenbank.Lobby.wirt[lobbycode]],"jojojojojojojo")
          datenbank.Lobby.host_websocket[lobbycode].send(JSON.stringify({
            type: 'new_round',
            data:{
              game: datenbank.Lobby.spielID[lobbycode].length,
              round: datenbank.Spiel.runden_id[datenbank.Lobby.spielID[lobbycode].length-1].length
            }
          }))
          
          break
        case "offer":
          console.log("WWWWWWWWWWWWWWWWWWWWWWWW")
          datenbank.Runden.angebot_id[runde-1].push(datenbank.Angebote.angebot_id.length)
          datenbank.Angebote.angebot_id.push(datenbank.Angebote.angebot_id.length)
          datenbank.Angebote.angebot_summe.push(JSON.parse(msg).data.amount)
          datenbank.Angebote.angebot_geber.push(spieler_id)
          console.log(spieler_id,"88888888888888888888")
          console.log(datenbank.Lobby.spieler_id[lobbycode].length!=datenbank.Runden.angebot_id[runde].length)
          
        items = datenbank.Lobby.spieler_id[lobbycode]
        datenbank.Lobby.host_websocket[lobbycode].send(JSON.stringify({
          type: 'new_offer',
          data:{
            amount:data.data.amount
          }
        }))
        if(datenbank.Lobby.spieler_id[lobbycode].length!=datenbank.Runden.angebot_id[runde-1].length){
             
          ws.send(JSON.stringify({
            type: "wait",
            data: {}

            
          }))
        
        }else{
          console.log(datenbank.Lobby.spieler_id.length!=datenbank.Runden.angebot_id.length)

          ws.send()
          let temp=[]
          //let geber = []
          //let angebote =[]
          //angebote = datenbank.Runden.angebot_id[runde-1]
          //angebote.forEach(function(element){
          //  geber = datenbank.Angebote.
          //})
          console.log(datenbank.Angebote)
          console.log(datenbank.Runden)
          console.log(datenbank.Angebote.angebot_geber)
          console.log(runde)
          datenbank.Runden.angebot_id[runde-1].forEach(function(element) {
            temp.push(datenbank.Angebote.angebot_geber[element])
            }
          )
          console.log(temp)
          console.log(temp,"jojojoojojojoo")
          temp = shuffle(temp)
          temp.forEach(function(element) {
            datenbank.Angebote.angebot_nehmer.push(element)
            }
          )
          console.log(temp, "jojoooaooaoaoaoao")
          console.log(temp.length)
          for (var i = datenbank.Runden.angebot_id[runde][0]; i < temp.length+datenbank.Runden.angebot_id[runde][0]; i++) {
            n=temp[i]
            datenbank.Angebote.angebot_nehmer[i] = n
          }
          for (var i = 0; i < temp.length; i++) {
            var n = temp[i];
            datenbank.Spieler.websocket[n].send(JSON.stringify({ //wird an den spieler geschickt oder
            type: "answer_offer",
            data: {
              game:datenbank.Lobby.spielID[lobbycode].length,
              round: datenbank.Spiel.runden_id[datenbank.Lobby.spielID[lobbycode].length-1].length,
              class: datenbank.Lobby.name,
              amount: datenbank.Angebote.angebot_summe[i]
            }
          }))}

            //schicke jedem message.type = answer_offer
          }
          break
        case "accept_offer":
          console.log(msg)
          
          
          datenbank.Angebote.angebot_angenommen[datenbank.Angebote.angebot_nehmer.indexOf(spieler_id)] = true
          console.log(datenbank.Angebote.angebot_nehmer, "   ", spieler_id)
          
            ws.send(JSON.stringify({
              type: "wait",
              data: {}
            }))
            datenbank.Lobby.host_websocket[lobbycode].send(JSON.stringify({
              type:"offer_response",
              data:{
                amount: datenbank.Angebote.angebot_summe[datenbank.Angebote.angebot_nehmer.indexOf(spieler_id)],
                accepted: true,
                test: 3
              }            }))

          break
          case "decline_offer":
          datenbank.Angebote.angebot_angenommen[datenbank.Angebote.angebot_nehmer.indexOf(spieler_id)] = false

          ws.send(JSON.stringify({
            type: "wait",
            data: {}
          }))
          datenbank.Lobby.host_websocket[lobbycode].send(JSON.stringify({
            type:"offer_response",
            data:{
              amount:datenbank.Angebote.angebot_summe[datenbank.Angebote.angebot_nehmer.indexOf(spieler_id)],
              accepted: false
            }
          }))
          break
        
        //offer_response
        //data
       // amount
        //accepted: 
            
        
        
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