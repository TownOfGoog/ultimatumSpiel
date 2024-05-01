import express from "express"
import expressWs from "express-ws"
import session from "express-session" 
import cors from "cors"
import crypto from 'crypto'
import path from "path"




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
    "gamestate":[],
    "open":[],
    "aktive_spieler":[]
  },
  "Lehrer":{
    "LehrerID":[],
    "benutzername":[],
    "kennwort":[]
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
export function startExpress() {
  var app = express();
  var expressWss = expressWs(app);
  //Wss 
  app.use(express.static(path.join(path.resolve('.'), 'frontend', 'build')));


  app.use(cors(
    {origin:process.env.FRONTEND_URL,
    credentials: true}
  )); 
  

  app.use(express.json());


  app.use(session({
    resave: false,
    secret: (Math.floor(10000000 + Math.random() * 90000000)+Math.floor(100000000 + Math.random() * 900000000)*Math.floor(1000000 + Math.random() * 9000000)).toString(),
    //resave: false,
    saveUninitialized: true,
    cookie: {
      maxAge: 86400000+Date.now(),  // 24 stunden
      httpOnly: true,
      secure: false
  }
  }));

let user_id
  //login
  function checkLoginAttempts(req, res, next) {
    const MAX_LOGIN_ATTEMPTS = 3;
    const BUFFER_PERIOD_DURATION = 5 * 60 * 1000; // 5 min

    if (!req.session.failedLoginAttempts) {
        req.session.failedLoginAttempts = 0;
    }

    if (req.session.bufferPeriod && req.session.bufferPeriod > Date.now()) {
        const remainingTime = Math.ceil((req.session.bufferPeriod - Date.now()) / 1000);
        return res.status(400).json(`Sie haben die maximalen Anmeldeversuche erreicht. Bitte versuchen Sie es in ${remainingTime} Sekunden erneut.`);
    }

    next();
}

app.post("/login", checkLoginAttempts, (req, res) => {
    const MAX_LOGIN_ATTEMPTS = 3;
    const BUFFER_PERIOD_DURATION = 5 * 60 * 1000; // 5 min

    if (!req.body.name || !req.body.password) {
        const remainingAttempts = MAX_LOGIN_ATTEMPTS - req.session.failedLoginAttempts;
        return res.status(400).json(`Fehlende Anmeldedaten`);
    }

    const user_id = datenbank.Lehrer.benutzername.indexOf(req.body.name);

    if (user_id !== -1 && crypto.createHash('sha256').update(req.body.password).digest('hex') === datenbank.Lehrer.kennwort[user_id]) {
        req.session.failedLoginAttempts = 0;

        req.session.userId = datenbank.Lehrer.LehrerID[user_id];

        return res.status(200).json(datenbank.Lehrer.benutzername[user_id]);
    } else {
        if (!req.session.failedLoginAttempts) {
            req.session.failedLoginAttempts = 1;
        } else {
            req.session.failedLoginAttempts++;
        }

        const remainingAttempts = MAX_LOGIN_ATTEMPTS - req.session.failedLoginAttempts;
        if (req.session.failedLoginAttempts >= MAX_LOGIN_ATTEMPTS) {
            req.session.bufferPeriod = Date.now() + BUFFER_PERIOD_DURATION;
            return res.status(401).json(`Sie haben die maximalen Anmeldeversuche erreicht. Bitte versuchen Sie es in 5 Minuten erneut.`);
        }

        return res.status(401).json(`Falsche Anmeldedaten, übrige Versuche: ${remainingAttempts}`);
    }
});



  


app.post("/register", (req, res) => {
    if (!req.body.name || !req.body.password) {
        return res.status(400).json("Fehlende Anmeldedaten");
    }
    if (datenbank.Lehrer.benutzername.includes(req.body.name)) {
        return res.status(409).json("Benutzername bereits vergeben");
    }
    if (req.body.password.length < 7){
      return res.status(400).json("Passwort muss mindestens 7 Zeichen lang sein")
    }

    console.log(req.body.name, req.body.password);
    datenbank.Lehrer.LehrerID.push(datenbank.Lehrer.LehrerID.length);
    datenbank.Lehrer.benutzername.push(req.body.name);
    datenbank.Lehrer.kennwort.push(crypto.createHash('sha256').update(req.body.password).digest('hex'));
    const user_id = datenbank.Lehrer.benutzername.indexOf(req.body.name);
    req.session.userId = datenbank.Lehrer.LehrerID[user_id];
    
    res.status(200).json(req.body.name);
});

  
  let counter = 0

  //jedes mal wenn wir vom Frontend eine Anfrage für eine Neue Lobby erhalten, /lobby/create   -----
  app.post("/lobby/create", (req, res) => {
    console.log(req.session.cookie.maxAge, Date.now())
    if (req.session.userId && req.session.cookie.maxAge >Date.now()){

    

    //es wird ein neuer Lobbycode generiert
    let newCode = Math.floor(Math.random() * 90000) + 10000

    //und in der Datenbank gespeichert
    datenbank.Lobby.lobby_kennwort.push(newCode)

    //sende den generierten lobbycode an das frontend
    res.status(200).json(newCode)

    //initialisiere Neuen Datenbank Tuppel
    datenbank.Lobby.LobbyID[datenbank.Lobby.LobbyID.length] = datenbank.Lobby.LobbyID.length
    datenbank.Lobby.wirt.push(datenbank.Lehrer.LehrerID[0])
    datenbank.Lobby.spieler_id.push([])
    datenbank.Lobby.spielID.push([])
    datenbank.Spiel.runden_id.push([])
    datenbank.Lobby.open.push(true)
    counter = 0
    datenbank.Lobby.name.push(req.body.name)
  }else{
    res.status(401).json("Nicht angemeldet")
  }
  })
  app.get("/check_login", (req, res) =>{
  if(req.session.userId === undefined){
    res.status(401).json("Nicht angemeldet")
  } else {
    res.status(200).json(datenbank.Lehrer.benutzername[req.session.userId])
  } 
  
  })

  app.get('/logout', (req, res) => {
    delete req.session.userId
    res.status(200).json('Abgemeldet')
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
    let runden
    let lobbycode
    let runde
    let spieler_id
    counter = counter +1
    let dieses_angebot
    
    //Verifiziert den Lobbycode
    if(datenbank.Lobby.lobby_kennwort.includes(parseInt(req.params.lobby))){
      //Setzt lobbycode(wichtigste Variabel)
      lobbycode = datenbank.Lobby.lobby_kennwort.indexOf(parseInt(req.params.lobby))
      datenbank.Lobby.open[lobbycode] == true
      console.log(datenbank.Lehrer, "jeeeeeee")

    } else {
      
      
      ws.close()
      return
    }
    datenbank.Lobby.open[lobbycode]==true
    //Kontrolliert Ob es Die Lehrperson ist
    if(counter == 1){
      //Füllt den Lehrer Table
      datenbank.Lehrer.websocket.push(ws)
      datenbank.Lobby.host_websocket.push(ws)
      console.log(datenbank.Lehrer, "jeeeeeee")

    }
    datenbank.Lobby.gamestate[lobbycode] = "pre"
    let amount
    //Jeder ausser die Lehrperson updated den Playercount und wird auf Pause gesetzt
    console.log(ws !== datenbank.Lobby.host_websocket[lobbycode]&&datenbank.Lobby.open[lobbycode]===true)
    console.log(datenbank.Lobby.open[lobbycode])
    if(ws !== datenbank.Lobby.host_websocket[lobbycode]&&datenbank.Lobby.open[lobbycode]===true){
      console.log("Schüler ist beigetereteten ")
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
    console.log(datenbank.Lehrer, "jeeeeeee")
    
    ;
    let angebot
    // if nachricht == "spiel startet":
      // Alle aus der Lobby erhalten Signal: "Spiel Startet"
      // nächste runde in die datenbank
    //place_offer answer_offer
    ws.on("close", function(msg) {
      try{
      if(ws == datenbank.Lobby.host_websocket[lobbycode]){
      datenbank.Lobby.lobby_kennwort[lobbycode] = 99999999999
      }


      if(ws != datenbank.Lobby.host_websocket[lobbycode]){
        let index = datenbank.Lobby.spieler_id[lobbycode].indexOf(spieler_id)
        let indexA
        if(datenbank.Lobby.gamestate[lobbycode] == "pre"){
          datenbank.Lobby.spieler_id[lobbycode].splice(index,1)
        }
        if(angebot!=undefined){
        if(datenbank.Runden.angebot_id[lobbycode][angebot]!=undefined){
          indexA = datenbank.Runden.angebot_id[runde-1].indexOf(angebot)
          if(datenbank.Lobby.spieler_id.length==datenbank.Runden.angebot_id[runde-1].length){
          let aktuelle_angebote = datenbank.Runden.angebot_id[runde-1]
          aktuelle_angebote.forEach(function(element){
            if(datenbank.Angebote.angebot_nehmer[element]==spieler_id){
              angebot = element
            }
          })
          
        }
      }}


      runden = datenbank.Lobby.spielID[lobbycode][datenbank.Lobby.spielID[lobbycode].length - 1]

      runden = datenbank.Spiel.runden_id[runden][datenbank.Spiel.runden_id[runden].length - 1]
      
      if(datenbank.Runden.angebot_id[runden].length!= 0||undefined){
      }
      
      
      if (index !== -1 && datenbank.Lobby.spielID[lobbycode][datenbank.Lobby.spielID[lobbycode].length - 1]) {


          datenbank.Lobby.spieler_id[lobbycode].splice(index, 1)
          if(datenbank.Runden.angebot_id[lobbycode][angebot]!=undefined&&datenbank.Angebote.angebot_angenommen[dieses_angebot]==undefined){
          datenbank.Runden.angebot_id[runde-1].splice(indexA, 1)
          let angebote2 = datenbank.Runden.angebot_id[runde-1]
          let antworten2 = []
          for (var i = 0; i < angebote2.length; i++) {
            var n = angebote2[i];
            antworten2.push(datenbank.Angebote.angebot_angenommen[n])
          }
          console.log(antworten2)
          console.log(!antworten2.includes(undefined))
          if(!antworten2.includes(undefined)){
            let geber = []
            let akzeptiert = []
            datenbank.Runden.angebot_id[runde-1].forEach(function(element) {
              geber.push(datenbank.Angebote.angebot_geber[element])
              akzeptiert.push(datenbank.Angebote.angebot_angenommen[element])
              })
              console.log(geber, akzeptiert)
              for (var i = 0; i < akzeptiert.length; i++) {
                var n = geber[i];
                datenbank.Spieler.websocket[n].send(JSON.stringify({ //wird an den spieler geschickt oder
                type: "final",
                data: {
                  accepted:akzeptiert[i]                  
                }
              }))}

            

          }
        }
        if(datenbank.Lobby.spieler_id[lobbycode].length==datenbank.Runden.angebot_id[runden].length&&datenbank.Lobby.gamestate[lobbycode]=="offer"){
          datenbank.Lobby.gamestate[lobbycode] = "answer_offer"
        let temp = []
        //let geber = []
        //let angebote =[]
        //angebote = datenbank.Runden.angebot_id[runde-1]
        //angebote.forEach(function(element){
        //  geber = datenbank.Angebote.
        //})
  
        //temp wird gecleared
        temp = []
        //temp zeigt alle leute die abgegeben haben in chronologischer Reihenfolge
        datenbank.Runden.angebot_id[runden].forEach(function(element) {
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
        angebote = datenbank.Runden.angebot_id[runden]
  
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
            amount: datenbank.Angebote.angebot_summe[angebote[i]]
          }
        }))}
        datenbank.Lobby.gamestate[lobbycode] = "answer_offer"
  
          //schicke jedem message.type = answer_offer
        }
      }
        
        if(datenbank.Angebote.angebot_angenommen[dieses_angebot]==undefined || datenbank.Lobby.gamestate[lobbycode]=="new_round"){
          if(dieses_angebot !== undefined && datenbank.Angebote.angebot_nehmer[datenbank.Runden.angebot_id[runde-1][0]]== undefined){
        datenbank.Lobby.host_websocket[lobbycode].send(JSON.stringify(
          {
            type: "undo_offer",
            data:{
              amount: amount
            }
          }
        ))}
        datenbank.Lobby.host_websocket[lobbycode].send(JSON.stringify({ //wird an den spieler geschickt oder
          type: "total_players",
          data: {
            amount: (datenbank.Lobby.aktive_spieler && datenbank.Lobby.aktive_spieler[lobbycode]) ? datenbank.Lobby.aktive_spieler[lobbycode] : datenbank.Lobby.spieler_id[lobbycode].length 
          }
        }))
      }
      
    }



      let angebote2 = datenbank.Runden.angebot_id[runde-1]
      let antworten2 = []
      for (var i = 0; i < angebote2.length; i++) {
        var n = angebote2[i];
        antworten2.push(datenbank.Angebote.angebot_angenommen[n])
      }
      console.log(antworten2)
      console.log(!antworten2.includes(undefined))
      if(!antworten2.includes(undefined)){
        let geber = []
        let akzeptiert = []
        datenbank.Runden.angebot_id[runde-1].forEach(function(element) {
          geber.push(datenbank.Angebote.angebot_geber[element])
          akzeptiert.push(datenbank.Angebote.angebot_angenommen[element])
          })
          console.log(geber, akzeptiert)
          for (var i = 0; i < akzeptiert.length; i++) {
            var n = geber[i];
            datenbank.Spieler.websocket[n].send(JSON.stringify({ //wird an den spieler geschickt oder
            type: "final",
            data: {
              accepted:akzeptiert[i]                  
            }
          }))}

        

      }


    }catch (error) {
      console.log("Error:", error)
    }
    })
    let items






    ws.on("message", function(msg) {
      try{

      if(datenbank.Spiel.runden_id[datenbank.Lobby.spielID[lobbycode][datenbank.Lobby.spielID[lobbycode].length - 1]]!== undefined){
      runde = datenbank.Lobby.spielID[lobbycode][datenbank.Lobby.spielID[lobbycode].length - 1]
      runde = datenbank.Spiel.runden_id[runde][datenbank.Spiel.runden_id[runde].length - 1]+1}

      let message = JSON.parse(msg)

      //switch Case der alle Spielstatusse unterscheiden kann
      switch(message.type){
        
        case "start_round":
          runde = datenbank.Runden.runden_id.length
          datenbank.Lobby.aktive_spieler[lobbycode] = undefined
          datenbank.Lobby.open[lobbycode] = false

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
              type: "place_offer"
            }))
        }

        datenbank.Lobby.host_websocket[lobbycode].send(JSON.stringify({
          type: 'new_round',
          data:{
            game: datenbank.Lobby.spielID[lobbycode].length,
            round: datenbank.Spiel.runden_id[spiel2].length,
            name: datenbank.Spiel.spiel_name[datenbank.Spiel.spiel_id.length-1]
          }
        }))
        
        datenbank.Lobby.host_websocket[lobbycode].send(JSON.stringify({ //wird an den spieler geschickt oder
          type: "total_players",
          data: {
            amount: datenbank.Lobby.spieler_id[lobbycode].length
          }
        }))
        
          break
        case "crash":
          console.log(hallo)
          break
        case "start_game":
          runde = datenbank.Runden.runden_id.length
          datenbank.Lobby.aktive_spieler[lobbycode] = undefined
          datenbank.Lobby.open[lobbycode] = false
          console.log(datenbank.Lobby.open[lobbycode])
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
            type: "place_offer"
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
          if([0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100].includes(message.data.amount)){
          //aktualisiert datenbank
          datenbank.Lobby.gamestate[lobbycode] = "offer"
          angebot = datenbank.Angebote.angebot_id.length
          datenbank.Runden.angebot_id[runde-1].push(datenbank.Angebote.angebot_id.length)
          datenbank.Angebote.angebot_id.push(datenbank.Angebote.angebot_id.length)
          datenbank.Angebote.angebot_summe.push(JSON.parse(msg).data.amount)
          datenbank.Angebote.angebot_geber.push(spieler_id)
          
          //Schickt dem Frontend wie viel der Spieler angeboten haben
          items = datenbank.Lobby.spieler_id[lobbycode]
          datenbank.Lobby.host_websocket[lobbycode].send(JSON.stringify({
            type: 'new_offer',
            data:{
              amount:message.data.amount
            }
          }))
          amount = message.data.amount
          //wenn nicht jeder abgegeben hat wird dem Spieler "wait" geschickt
          console.log(datenbank.Runden.angebot_id) 
          if(datenbank.Lobby.spieler_id[lobbycode].length!=datenbank.Runden.angebot_id[runde-1].length){
            
            ws.send(JSON.stringify({
              type: "wait"
              
            }))
            dieses_angebot = "a"
          }else{
            datenbank.Lobby.gamestate[lobbycode] = "answer_offer"
            
          let temp = []
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
              amount: datenbank.Angebote.angebot_summe[angebote[i]]
            }
          }))}
          datenbank.Lobby.gamestate[lobbycode] = "answer_offer"

            //schicke jedem message.type = answer_offer
          }
        }else{
          
          ws.send(JSON.stringify({ //wird an den spieler geschickt oder
            type: "place_offer",
            data: {
              error: "Ungültiges Angebot"
            }
          }))}

          
        
          break
        case "accept_offer":

          //findet das aktuelle angebot
          let aktuelle_angebote = datenbank.Runden.angebot_id[runde-1]
          aktuelle_angebote.forEach(function(element){
            if(datenbank.Angebote.angebot_nehmer[element]==spieler_id){
              dieses_angebot = element
            }
          })
          
          //aktualisiert die Datenbank
          datenbank.Angebote.angebot_angenommen[datenbank.Angebote.angebot_nehmer.indexOf(spieler_id)] = true
          
            //sendet dem Spieler "wait" und dem Lehrer die Daten
            ws.send(JSON.stringify({
              type: "wait"
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
            type: "wait"
          }))
          datenbank.Lobby.host_websocket[lobbycode].send(JSON.stringify({
            type:"offer_response",
            data:{
              amount:datenbank.Angebote.angebot_summe[dieses_angebot2],
              accepted: false
            }
          }))
          let angebote = datenbank.Runden.angebot_id[runde-1]
          console.log(angebote)
          let antworten = []
          for (var i = 0; i < angebote.length; i++) {
            var n = angebote[i];
            antworten.push(datenbank.Angebote.angebot_angenommen[n])
          }
          console.log(antworten)
          console.log(!antworten.includes(undefined))
          if(!antworten.includes(undefined)){
            let geber = []
            let akzeptiert = []
            datenbank.Runden.angebot_id[runde-1].forEach(function(element) {
              geber.push(datenbank.Angebote.angebot_geber[element])
              akzeptiert.push(datenbank.Angebote.angebot_angenommen[element])
              })
              console.log(geber, akzeptiert)

              for (var i = 0; i < akzeptiert.length; i++) {
                var n = geber[i];
                datenbank.Spieler.websocket[n].send(JSON.stringify({ //wird an den spieler geschickt oder
                type: "final",
                data: {
                  accepted:akzeptiert[i]                  
                }
              }))}

            

          }

          break
          case "skip":


          
            if(ws === datenbank.Lobby.host_websocket){

              return
            }



            switch(datenbank.Lobby.gamestate[lobbycode]){
              case "offer":
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

          for (var i = 0; i < temp.length; i++) {
            var n = temp[i];
            datenbank.Spieler.websocket[n].send(JSON.stringify({
            type: "answer_offer",
            data: {
              game:datenbank.Lobby.spielID[lobbycode].length,
              round: datenbank.Spiel.runden_id[datenbank.Lobby.spielID[lobbycode].length-1].length,
              amount: datenbank.Angebote.angebot_summe[angebote[i]]
            }
          }))}
          for (var i = 0; i < enten.length; i++) {
            var n = enten[i];
            datenbank.Spieler.websocket[n].send(JSON.stringify({ 
            type: "wait"
          }))}
          datenbank.Lobby.host_websocket[lobbycode].send(JSON.stringify({ 
            type: "total_players",
            data: {
              amount: temp.length
            }
          }))
          datenbank.Lobby.aktive_spieler[lobbycode] = temp.length
          

              break
              case "answer_offer":
              let angebot = datenbank.Runden.angebot_id[runde-1]

              let antworten = []
              for (var i = 0; i < angebot.length; i++) {
                var n = angebot[i];
                antworten.push(datenbank.Angebote.angebot_angenommen[n])
              }
              console.log(antworten)
              console.log(!antworten.includes(undefined))
              if(!antworten.includes(undefined)){
                let geber = []
                let akzeptiert = []
                datenbank.Runden.angebot_id[runde-1].forEach(function(element) {
                  geber.push(datenbank.Angebote.angebot_geber[element])
                  akzeptiert.push(datenbank.Angebote.angebot_angenommen[element])
                  })
                  console.log(geber, akzeptiert)
    
                  for (var i = 0; i < akzeptiert.length; i++) {
                    var n = geber[i];
                    datenbank.Spieler.websocket[n].send(JSON.stringify({ 
                    type: "final",
                    data: {
                      accepted:akzeptiert[i]                  
                    }
                  }))}
    
                
    
              }



              break
            }
          

          break
          case ("exit"):
            
            for (var i = 0; i < datenbank.Lobby.spieler_id[lobbycode].length; i++) {
              var g = datenbank.Lobby.spieler_id[lobbycode][i];
              datenbank.Spieler.websocket[g].send(JSON.stringify({ 
              type: "exit",
              data: {}
            }))}
            datenbank.Lobby.lobby_kennwort[lobbycode] = undefined
          break
      

        

      }
  }catch (error) {
    console.log("Error:", error)
  }})

        
  })

  
  app.get('/*', (req, res, next) => {
    res.sendFile(path.join(path.resolve('.'), 'frontend', 'build', '/index.html'))
  })

  
  
  return app
}

startExpress()


