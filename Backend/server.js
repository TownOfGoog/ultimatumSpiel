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

//Initialisiere Datenbank
let datenbank = {
  "Lobby":{
    "LobbyID":[],
    "spielID":[[]],
    "wirt":[],
    "spieler_id":[[]],
    "lobby_kennwort":[],
    "name": [],
    "host_websocket":[],
    "gamestate":[]
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
    "spiel_name":[],
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

//express
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

  app.post("/register", (req, res) =>{
    //test zum hochladen
    if(datenbank.Lehrer.benutzername.includes(req.body.name)){res.send("Vergeben")}else{
    datenbank.Lehrer.LehrerID.push(datenbank.Lehrer.LehrerID.length)
    datenbank.Lehrer.benutzername.push(req.body.name)
    datenbank.Lehrer.passwort.push(req.body.passwort)
    datenbank.Lehrer.email.push(req.body.email)}
    
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
    

    //es wird ein neuer Lobbycode generiert
    let newCode = Math.floor(Math.random() * 90000) + 10000

    //und in der Datenbank gespeichert
    datenbank.Lobby.lobby_kennwort.push(newCode)

    //sende den generierten lobbycode an das frontend
    res.send(JSON.stringify(newCode))

    //initialisiere Neuen Datenbank Tuppel
    datenbank.Lobby.LobbyID[datenbank.Lobby.LobbyID.length] = datenbank.Lobby.LobbyID.length
    datenbank.Lobby.wirt.push(datenbank.Lehrer.LehrerID[0])
    datenbank.Lobby.spieler_id.push([])
    datenbank.Lobby.spielID.push([])
    datenbank.Spiel.runden_id.push([])
    counter = 0
    datenbank.Lobby.name.push(req.body.name)
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

    //initialisiere Variabeln
    let open
    let lobbycode
    let runde
    let spieler_id
    counter = counter +1
    open = true
    
    //Verifiziert den Lobbycode
    if(datenbank.Lobby.lobby_kennwort.includes(parseInt(req.params.lobby))){
      //Setzt lobbycode(wichtigste Variabel)
      lobbycode = datenbank.Lobby.lobby_kennwort.indexOf(parseInt(req.params.lobby))
    } else {


      ws.close()
      return
    }
    //Kontrolliert Ob es Die Lehrperson ist
    if(counter == 1){
      //Füllt den Lehrer Table
      datenbank.Lehrer.websocket.push(ws)
      datenbank.Lobby.host_websocket.push(ws)
    }

    
    //Jeder ausser die Lehrperson updated den Playercount und wird auf Pause gesetzt
    if(ws !== datenbank.Lobby.host_websocket[lobbycode]&&open===true){
      let spieler = datenbank.Spieler.spieler_id.length
      datenbank.Spieler.spieler_id.push(spieler)
      spieler_id=spieler
      datenbank.Spieler.websocket.push(ws)
      datenbank.Lobby.spieler_id[lobbycode].push(spieler)
      ws.send(JSON.stringify({
        type: "wait",
        data: {
          class: datenbank.Lobby.name[lobbycode]
        }
      }))
      //Lehrperson Playercount wird geupdated
      datenbank.Lehrer.websocket[lobbycode].send(JSON.stringify({
        type: 'new_player',
      }))
      
    }
    
    ;

    // if nachricht == "spiel startet":
      // Alle aus der Lobby erhalten Signal: "Spiel Startet"
      // nächste runde in die datenbank
    //place_offer answer_offer
    ws.on("close", function(msg) {
      if(ws == datenbank.Lobby.host_websocket[lobbycode]){
        console.log("moin")
      datenbank.Lobby.lobby_kennwort[lobbycode] = 0

      }

      if(ws != datenbank.Lobby.host_websocket[lobbycode]){
        let index = datenbank.Lobby.spieler_id[lobbycode].indexOf(spieler_id)
        if (index !== -1) {
          datenbank.Lobby.spieler_id[lobbycode].splice(index, 1)
        }
        datenbank.Lobby.host_websocket[lobbycode].send(JSON.stringify({ //wird an den spieler geschickt oder
          type: "total_players",
          data: {
            amount: datenbank.Lobby.spieler_id[lobbycode].length
          }
        }))
      }

      console.log(datenbank.Lobby.spieler_id[lobbycode])
    })
    let items
    ws.on("message", function(msg) {
      runde = datenbank.Runden.runden_id.length

      let message = JSON.parse(msg)

      //switch Case der alle Spielstatusse unterscheiden kann
      switch(message.type){
        case "start_round":
          //findet Heraus in welchem Spiel wir uns Befinden
          let spiel2 = datenbank.Lobby.spielID[lobbycode][datenbank.Lobby.spielID[lobbycode].length-1]

          //findet heraus wie Viele runden existieren
          let temp = datenbank.Runden.runden_id.length

          //Datenbank wird aktualisiert
          datenbank.Runden.runden_id.push(temp)
          datenbank.Spiel.runden_id[spiel2].push(temp)
          datenbank.Runden.angebot_id.push([])

          //
          items = datenbank.Lobby.spieler_id[lobbycode]

          //aktualisiert den gamestate, für den Fall eines "skip"s
          datenbank.Lobby.gamestate[lobbycode] = "new_round"
          //schickt allen spielern alle infos
          for (var i = 0; i < items.length; i++) {
            var n = items[i];
            datenbank.Lobby.host_websocket[lobbycode].send(JSON.stringify({
              type: 'new_round',
              data:{
                game: datenbank.Lobby.spielID[lobbycode].length,
                round: datenbank.Spiel.runden_id[spiel2].length,
                class:datenbank.Lobby.name[lobbycode],
                name: datenbank.Spiel.spiel_name[datenbank.Spiel.spiel_id.length-1]
              }
            }))
            datenbank.Spieler.websocket[n].send(JSON.stringify({
              type: 'new_round',
              data:{
                game: datenbank.Lobby.spielID[lobbycode].length,
                round: datenbank.Spiel.runden_id[spiel2].length,
                class:datenbank.Lobby.name[lobbycode],
                name: datenbank.Spiel.spiel_name[datenbank.Spiel.spiel_id.length-1]
              }
            }))
            datenbank.Spieler.websocket[n].send(JSON.stringify({ //wird an den spieler geschickt oder
              type: "place_offer",
              data: {
                game: datenbank.Lobby.spielID[lobbycode].length,
                round: datenbank.Spiel.runden_id[spiel2].length,
                class: datenbank.Lobby.name[lobbycode],
                name: datenbank.Spiel.spiel_name[datenbank.Spiel.spiel_id.length-1]

              }
            }))
        }
        
        datenbank.Lobby.host_websocket[lobbycode].send(JSON.stringify({ //wird an den spieler geschickt oder
          type: "total_players",
          data: {
            amount: datenbank.Lobby.spieler_id[lobbycode].length
          }
        }))
        
          break
        case "start_game":
          open = false
          //aktualisiert die Datenbank
          datenbank.Lobby.gamestate[lobbycode] = "new_round"
          let spiel_id = datenbank.Spiel.spiel_id.length
          datenbank.Spiel.runden_id.push([])
          datenbank.Spiel.spiel_id.push(spiel_id)
          datenbank.Lobby.spielID[lobbycode].push(spiel_id)
          datenbank.Runden.runden_id.push(runde)
          datenbank.Spiel.runden_id[spiel_id].push(runde)
          datenbank.Runden.angebot_id.push([])
          datenbank.Spiel.spiel_name.push(message.data.name)
          
          //findet heraus in welchem Spiel wir uns befinden
          let spiel = datenbank.Lobby.spielID[lobbycode][datenbank.Lobby.spielID[lobbycode].length-1]

          items = datenbank.Lobby.spieler_id[lobbycode]

          //schickt allen Spielern die Informationen, die sie brauchen
          for (var i = 0; i < items.length; i++) {
            var n = items[i];
            datenbank.Spieler.websocket[n].send(JSON.stringify({
              type: 'new_round',
              data:{
                game: datenbank.Lobby.spielID[lobbycode].length,
                round: datenbank.Spiel.runden_id[spiel].length,
                class:datenbank.Lobby.name[lobbycode],
                name: datenbank.Spiel.spiel_name[spiel_id]
              }
            }))
          datenbank.Spieler.websocket[n].send(JSON.stringify({ //wird an den spieler geschickt oder
            type: "place_offer",
            data: {}
          }))
        }
          datenbank.Lobby.host_websocket[lobbycode].send(JSON.stringify({
            type: 'new_round',
            data:{
              game: datenbank.Lobby.spielID[lobbycode].length,
              round: datenbank.Spiel.runden_id[spiel].length,
              class: datenbank.Lobby.name[lobbycode],
              name: message.data.name
            }
          }))
          datenbank.Lobby.host_websocket[lobbycode].send(JSON.stringify({ //wird an den spieler geschickt oder
            type: "total_players",
            data: {
              amount: datenbank.Lobby.spieler_id[lobbycode].length
            }
          }))
          
          break
        case "offer":
          //aktualisiert datenbank
          datenbank.Runden.angebot_id[runde-1].push(datenbank.Angebote.angebot_id.length)
          datenbank.Angebote.angebot_id.push(datenbank.Angebote.angebot_id.length)
          datenbank.Angebote.angebot_summe.push(JSON.parse(msg).data.amount)
          datenbank.Angebote.angebot_geber.push(spieler_id)
          
          //Schickt dem Frontend wie viel der Spieler angeboten hat
          items = datenbank.Lobby.spieler_id[lobbycode]
          datenbank.Lobby.host_websocket[lobbycode].send(JSON.stringify({
            type: 'new_offer',
            data:{
              amount:message.data.amount
            }
          }))
          //wenn nicht jeder abgegeben hat wird dem Spieler "wait" geschickt
          if(datenbank.Lobby.spieler_id[lobbycode].length!=datenbank.Runden.angebot_id[runde-1].length){
            
            ws.send(JSON.stringify({
              type: "wait",
              data: {}
              
              
            }))
            
          }else{
            datenbank.Lobby.gamestate[lobbycode] = "answer_offer"
            
          let temp=[]
          //let geber = []
          //let angebote =[]
          //angebote = datenbank.Runden.angebot_id[runde-1]
          //angebote.forEach(function(element){
          //  geber = datenbank.Angebote.
          //})

          //temp wird gecleared
          temp = []
          //temp zeigt alle leute die abgegeben haben in chronologischer Reihenfolge
          datenbank.Runden.angebot_id[runde-1].forEach(function(element) {
            temp.push(datenbank.Angebote.angebot_geber[element])
            }
          )

          //die angebot_geber werden vermischt
          temp = shuffle(temp)
          temp.forEach(function(element) {
            datenbank.Angebote.angebot_nehmer.push(element)
            }
          )
          //alle angebot_IDs der Runde 
          let angebote
          angebote = []
          angebote = datenbank.Runden.angebot_id[runde-1]

          //die vermischten angebot_geber werden in die angebot_nehmer gefüllt
          for (var i = 0; i < temp.length; i++) {
            datenbank.Angebote.angebot_nehmer[angebote[i]] = temp[i]
          }


          //alle angebot_nehmer bekommen die angebote der angebot geber
          for (var i = 0; i < temp.length; i++) {
            var n = temp[i];
            datenbank.Spieler.websocket[n].send(JSON.stringify({ //wird an den spieler geschickt oder
            type: "answer_offer",
            data: {
              game:datenbank.Lobby.spielID[lobbycode].length,
              round: datenbank.Spiel.runden_id[datenbank.Lobby.spielID[lobbycode].length-1].length,
              class: datenbank.Lobby.name,
              amount: datenbank.Angebote.angebot_summe[angebote[i]]
            }
          }))}
          datenbank.Lobby.gamestate[lobbycode] = "answer_offer"

            //schicke jedem message.type = answer_offer
          }
          break
        case "accept_offer":

          //findet das aktuelle angebot
          let aktuelle_angebote = datenbank.Runden.angebot_id[runde-1]
          let dieses_angebot
          aktuelle_angebote.forEach(function(element){
            if(datenbank.Angebote.angebot_nehmer[element]==spieler_id){
              dieses_angebot = element
            }
          })
          
          //aktualisiert die Datenbank
          datenbank.Angebote.angebot_angenommen[datenbank.Angebote.angebot_nehmer.indexOf(spieler_id)] = true
          
            //sendet dem Spieler "wait" und dem Lehrer die Daten
            ws.send(JSON.stringify({
              type: "wait",
              data: {}
            }))
            datenbank.Lobby.host_websocket[lobbycode].send(JSON.stringify({
              type:"offer_response",
              data:{
                amount: datenbank.Angebote.angebot_summe[dieses_angebot],
                accepted: true,
              }            }))

          break
          case "decline_offer":
            //sihe accept_offer
          datenbank.Angebote.angebot_angenommen[datenbank.Angebote.angebot_nehmer.indexOf(spieler_id)] = false
          
          let aktuelle_angebote2 = datenbank.Runden.angebot_id[runde-1]
          let dieses_angebot2
          aktuelle_angebote2.forEach(function(element){
            if(datenbank.Angebote.angebot_nehmer[element]==spieler_id){
              dieses_angebot2 = element
            }
          })

          ws.send(JSON.stringify({
            type: "wait",
            data: {}
          }))
          datenbank.Lobby.host_websocket[lobbycode].send(JSON.stringify({
            type:"offer_response",
            data:{
              amount:datenbank.Angebote.angebot_summe[dieses_angebot2],
              accepted: false
            }
          }))


          break
          case "skip":

          
            if(ws === datenbank.Lobby.host_websocket){

              return
            }


            switch(datenbank.Lobby.gamestate[lobbycode]){
              case "new_round":

                datenbank.Lobby.gamestate[lobbycode] = "answer_offer"
                


                let temp=[]
          //let geber = []
          //let angebote =[]
          //angebote = datenbank.Runden.angebot_id[runde-1]
          //angebote.forEach(function(element){
          //  geber = datenbank.Angebote.
          //})

          temp = []
          datenbank.Runden.angebot_id[runde-1].forEach(function(element) {
            temp.push(datenbank.Angebote.angebot_geber[element])
            }
          )
          let enten
          let mensch
          enten = []
          for(var i = 0; i < datenbank.Lobby.spieler_id[lobbycode].length; i++){
            mensch = datenbank.Lobby.spieler_id[lobbycode][i]
            if(!temp.includes(mensch)){
              enten.push(mensch)
            }
          }


          temp = shuffle(temp)
          temp.forEach(function(element) {
            datenbank.Angebote.angebot_nehmer.push(element)
            }
          )
          let angebote
          angebote = []
          angebote = datenbank.Runden.angebot_id[runde-1]


          for (var i = 0; i < temp.length; i++) {
            datenbank.Angebote.angebot_nehmer[angebote[i]] = temp[i]
          }

          console.log(temp)

            console.log(temp!=[ undefined ], temp!=[])
            console.log(temp)
            console.log(temp.length)
          for (var i = 0; i < temp.length; i++) {
            var n = temp[i];
            datenbank.Spieler.websocket[n].send(JSON.stringify({ //wird an den spieler geschickt oder
            type: "answer_offer",
            data: {
              game:datenbank.Lobby.spielID[lobbycode].length,
              round: datenbank.Spiel.runden_id[datenbank.Lobby.spielID[lobbycode].length-1].length,
              class: datenbank.Lobby.name,
              amount: datenbank.Angebote.angebot_summe[angebote[i]]
            }
          }))}
          for (var i = 0; i < enten.length; i++) {
            var n = enten[i];
            datenbank.Spieler.websocket[n].send(JSON.stringify({ //wird an den spieler geschickt oder
            type: "wait",
            data: {}
          }))}
          datenbank.Lobby.host_websocket[lobbycode].send(JSON.stringify({ //wird an den spieler geschickt oder
            type: "total_players",
            data: {
              amount: temp.length
            }
          }))

              break
              case "answer_offer":
                console.log("rorororororororor")

                if(ws != datenbank.Lobby.host_websocket){return}
                for (var i = 0; i < datenbank.Lobby.spieler_id; i++) {
                  var n = datenbank.Lobby.spieler_id[i];
                  datenbank.Spieler.websocket[n].send(JSON.stringify({ //wird an den spieler geschickt oder
                  type: "wait",
                  data: {}
                }))}




              break
            }
          

          break
          case ("exit"):
            
            for (var i = 0; i < datenbank.Lobby.spieler_id[lobbycode].length; i++) {
              var g = datenbank.Lobby.spieler_id[lobbycode][i];
              console.log(datenbank.Lobby.spieler_id[lobbycode][i])
              console.log("W")
              datenbank.Spieler.websocket[g].send(JSON.stringify({ //wird an den spieler geschickt oder
              type: "exit",
              data: {}
            }))}
            console.log("jojojo")
            datenbank.Lobby.lobby_kennwort[lobbycode] = undefined
          break

        

      }
    })

        
  })

  
  

  
  
  return app.listen(8080);
}

startExpress()

