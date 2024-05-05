import express from "express"
import expressWs from "express-ws"
import session from "express-session" 
import crypto from 'crypto'
import path from "path"




function shuffle(array) { // function to shuffle an array
  let n = array[0]
  array.shift()
  array.push(n)
  return array
}

let database = { //initilise database
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

function send_final(round, key){ // function to send wheather theire offer has been accepted
  let offer = database.Runden.angebot_id[round-1]
  let antworten = []
  for (var i = 0; i < offer.length; i++) {
    var n = offer[i];
    antworten.push(database.Angebote.angebot_angenommen[n])
  }

  if(!antworten.includes(undefined) || key != undefined){  // checks wheather if any evaluationes are undefined or if its a special case a.k.a. key is set
    let giver = []
    let accepted = []
    database.Runden.angebot_id[round-1].forEach(function(element) {
      giver.push(database.Angebote.angebot_geber[element])
      accepted.push(database.Angebote.angebot_angenommen[element])
      })
      console.log("final Results getting sent")
      for (var i = 0; i < accepted.length; i++) { // itterates through all evaluationes of the round
        var n = giver[i];
        if(accepted[i] != undefined){
        database.Spieler.websocket[n].send(JSON.stringify({ //sends to all players
        type: "final",
        data: {
          accepted:accepted[i]                  
        }
      }))}
    }
  }
}

export function startExpress() { // express
  var app = express();
  var expressWss = expressWs(app);
  app.use(express.static(path.join(path.resolve('.'), 'frontend', 'build'))); //wss

  app.use(express.json());


  app.use(session({ 
    resave: false,
    secret: (Math.floor(10000000 + Math.random() * 90000000)+Math.floor(100000000 + Math.random() * 900000000)*Math.floor(1000000 + Math.random() * 9000000)).toString(),
    saveUninitialized: true,
    cookie: {
      maxAge: 86400000+Date.now(),  // 24 hours
      httpOnly: true,
      secure: false
  }
  }));

  function checkLoginAttempts(req, res, next) {
    const MAX_LOGIN_ATTEMPTS = 3;
    const BUFFER_PERIOD_DURATION = 5 * 60 * 1000; // 5 min

    if (!req.session.failedLoginAttempts) { 
        req.session.failedLoginAttempts = 0; // initiates session attempts if necessary
    }

    if (req.session.bufferPeriod && req.session.bufferPeriod > Date.now()) { // checks if login cooldown has finished
        const remainingTime = Math.ceil((req.session.bufferPeriod - Date.now()) / 1000);
        return res.status(400).json(`Sie haben die maximalen Anmeldeversuche erreicht. Bitte versuchen Sie es in ${remainingTime} Sekunden erneut.`);
    }

    next();
}

app.post("/login", checkLoginAttempts, (req, res) => {
    const MAX_LOGIN_ATTEMPTS = 3;
    const BUFFER_PERIOD_DURATION = 5 * 60 * 1000; // 5 min

    if (!req.body.name || !req.body.password) { // checks if login data is missing
        return res.status(400).json(`Fehlende Anmeldedaten`);
    }

    const user_id = database.Lehrer.benutzername.indexOf(req.body.name);

    if (user_id !== -1 && crypto.createHash('sha256').update(req.body.password).digest('hex') === database.Lehrer.kennwort[user_id]) { // checks validity of the password
        req.session.failedLoginAttempts = 0;

        req.session.userId = database.Lehrer.LehrerID[user_id];

        return res.status(200).json(database.Lehrer.benutzername[user_id]);
    } else { //happens when all data is present but the data is wrong
        if (!req.session.failedLoginAttempts) { // handels login attempts
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
    if (!req.body.name || !req.body.password) { // checks if registration data is missing
        return res.status(400).json("Fehlende Anmeldedaten");
    }
    if (database.Lehrer.benutzername.includes(req.body.name)) { // checks if username is already taken+
        return res.status(409).json("Benutzername bereits vergeben");
    }
    if (req.body.password.length < 7){ // checks for password length
      return res.status(400).json("Passwort muss mindestens 7 Zeichen lang sein")
    }

    database.Lehrer.LehrerID.push(database.Lehrer.LehrerID.length);
    database.Lehrer.benutzername.push(req.body.name);
    database.Lehrer.kennwort.push(crypto.createHash('sha256').update(req.body.password).digest('hex'));
    const user_id = database.Lehrer.benutzername.indexOf(req.body.name);
    req.session.userId = database.Lehrer.LehrerID[user_id];
    
    res.status(200).json(req.body.name);
  });

  app.post("/lobby/create", (req, res) => {
    if (req.session.userId !== undefined && req.session.cookie.maxAge >Date.now()){
    
    let newCode = Math.floor(Math.random() * 90000) + 10000 // generates new lobbycode

    database.Lobby.lobby_kennwort.push(newCode) // saves the new code in database

    res.status(200).json(newCode) // returns generated code to the Frontend

    database.Lobby.LobbyID[database.Lobby.LobbyID.length] = database.Lobby.LobbyID.length // prepares database for new lobby
    database.Lobby.wirt.push(database.Lehrer.LehrerID[0])
    database.Lobby.spieler_id.push([])
    database.Lobby.spielID.push([])
    database.Spiel.runden_id.push([])
    database.Lobby.open.push(true)
    database.Lobby.name.push(req.body.name)
  }else{ // triggers when not logged in
    res.status(401).json("Nicht angemeldet")
  }
  })
  app.get("/check_login", (req, res) =>{ // checks if user is logged in
  if(req.session.userId === undefined){ // having no session.userId defines you as not logged in
    res.status(401).json("Nicht angemeldet")
  } else {
    res.status(200).json(database.Lehrer.benutzername[req.session.userId])
  } 
  
  })

  app.get('/logout', (req, res) => { // loggs user out
    delete req.session.userId
    res.status(200).json('Abgemeldet')
  })
  
   var wss = expressWss.getWss('/lobby/:lobby');
  app.ws('/lobby/:lobby', function(ws, req) {
    let round_amount
    let lobby_id
    let round
    let player_id
    let this_offer
    let amount
    
    if(database.Lobby.lobby_kennwort.includes(parseInt(req.params.lobby))){
      lobby_id = database.Lobby.lobby_kennwort.indexOf(parseInt(req.params.lobby)) // 
      database.Lobby.open[lobby_id] == true
      console.log(database.Lehrer, "jeeeeeee")
    } else {
      ws.close()
      return
    }

    database.Lobby.open[lobby_id]==true // makes the lobby ready to enter
    if(database.Lobby.host_websocket[lobby_id] == undefined){ // verifies that this is the host
      database.Lobby.host_websocket.push(ws)
    }

    database.Lobby.gamestate[lobby_id] = "pre" // signals no game has startet jet
    console.log(ws !== database.Lobby.host_websocket[lobby_id]&&database.Lobby.open[lobby_id]===true)
    console.log(database.Lobby.open[lobby_id])

    if(ws !== database.Lobby.host_websocket[lobby_id]&&database.Lobby.open[lobby_id]===true){  // verifies that this is a player
      console.log("Player entered Lobby")
      player_id = database.Spieler.spieler_id.length
      database.Spieler.spieler_id.push(player_id)
      database.Spieler.websocket.push(ws)
      database.Lobby.spieler_id[lobby_id].push(player_id)
      ws.send(JSON.stringify({
        type: "wait",
        data: {
          class: database.Lobby.name[lobby_id]
        }
      }))
      database.Lobby.host_websocket[lobby_id].send(JSON.stringify({ // updates the playercount for the host
        type: 'new_player',
      }))
      
    }
    
    let offer

    ws.on("close", function(msg) {
      try{
      if(ws == database.Lobby.host_websocket[lobby_id]){ // lets everyone know when the host leaves
        for (var i = 0; i < database.Lobby.spieler_id[lobby_id].length; i++) {
          var g = database.Lobby.spieler_id[lobby_id][i];
          database.Spieler.websocket[g].send(JSON.stringify({ 
          type: "exit"
        }))}
        database.Lobby.lobby_kennwort[lobby_id] = undefined      
      }

      
      if(ws != database.Lobby.host_websocket[lobby_id]){ //adjusts database
        let index = database.Lobby.spieler_id[lobby_id].indexOf(player_id)
        let indexA
        if(database.Lobby.gamestate[lobby_id] == "pre"){
          database.Lobby.spieler_id[lobby_id].splice(index,1)
        }
        if(offer!=undefined){
        if(database.Runden.angebot_id[lobby_id][offer]!=undefined){
          indexA = database.Runden.angebot_id[round-1].indexOf(offer)
          if(database.Lobby.spieler_id.length==database.Runden.angebot_id[round-1].length){
          let aktuelle_angebote = database.Runden.angebot_id[round-1]
          aktuelle_angebote.forEach(function(element){
            if(database.Angebote.angebot_nehmer[element]==player_id){
              offer = element
            }
          })
          
        }
      }
    }

    if(database.Lobby.spielID[lobby_id][database.Lobby.spielID[lobby_id].length - 1] === !undefined){
    round_amount = database.Lobby.spielID[lobby_id][database.Lobby.spielID[lobby_id].length - 1]
      if(database.Spiel.runden_id[round_amount][database.Spiel.runden_id[round_amount].length - 1] === !undefined){
        round_amount = database.Spiel.runden_id[round_amount][database.Spiel.runden_id[round_amount].length - 1]
      }else{round_amount = 0}
    }else{round_amount = 0}

      if(database.Runden.angebot_id[round_amount].length!= 0||undefined){
      }
      
      if (index !== -1 && database.Lobby.spielID[lobby_id][database.Lobby.spielID[lobby_id].length - 1]) {


        database.Lobby.spieler_id[lobby_id].splice(index, 1)
        if(database.Runden.angebot_id[lobby_id][offer]!=undefined&&database.Angebote.angebot_angenommen[this_offer]==undefined){
        database.Runden.angebot_id[round-1].splice(indexA, 1)
        send_final(round, "key")
        }

        if(database.Lobby.spieler_id[lobby_id].length==database.Runden.angebot_id[round_amount].length&&database.Lobby.gamestate[lobby_id]=="offer"){
        database.Lobby.gamestate[lobby_id] = "answer_offer"
        let players_to_shuffle = []

        players_to_shuffle = []
        database.Runden.angebot_id[round_amount].forEach(function(element) {
          players_to_shuffle.push(database.Angebote.angebot_geber[element]) // sorts everyone in chronological order of having given an offer
          }
        )
  
        players_to_shuffle = shuffle(players_to_shuffle) //players to shuffle get shuffled
        players_to_shuffle.forEach(function(element) {
          database.Angebote.angebot_nehmer.push(element)
          }
        )

        let offers
        offers = []
        offers = database.Runden.angebot_id[round_amount]
  
        for (var i = 0; i < players_to_shuffle.length; i++) {
          database.Angebote.angebot_nehmer[offers[i]] = players_to_shuffle[i] // shuffled players will now be the offer recievers
        }
  
        for (var i = 0; i < players_to_shuffle.length; i++) { // sends to all players
          var n = players_to_shuffle[i];
          database.Spieler.websocket[n].send(JSON.stringify({ 
          type: "answer_offer",
          data: {
            amount: database.Angebote.angebot_summe[offers[i]]
          }
        }))}
        database.Lobby.gamestate[lobby_id] = "answer_offer" // updates the gamestate
  
        }
      }
        
        if(database.Angebote.angebot_angenommen[this_offer]==undefined || database.Lobby.gamestate[lobby_id]=="new_round"){
          if(this_offer !== undefined && database.Angebote.angebot_nehmer[database.Runden.angebot_id[round-1][0]]== undefined){
        database.Lobby.host_websocket[lobby_id].send(JSON.stringify(
          {
            type: "undo_offer",
            data:{
              amount: amount
            }
          }
        ))}
        database.Lobby.host_websocket[lobby_id].send(JSON.stringify({ 
          type: "total_players",
          data: {
            amount: (database.Lobby.aktive_spieler && database.Lobby.aktive_spieler[lobby_id]) ? database.Lobby.aktive_spieler[lobby_id] : database.Lobby.spieler_id[lobby_id].length 
          }
        }))
      }
      
    }


    if(round==!undefined){ 
      send_final(round, "key")
    }

    }catch (error) {
      console.log("Error:", error)
    }
    })
    let all_players

    ws.on("message", function(msg) {
      try{

      if(database.Spiel.runden_id[database.Lobby.spielID[lobby_id][database.Lobby.spielID[lobby_id].length - 1]]!== undefined){
      round = database.Lobby.spielID[lobby_id][database.Lobby.spielID[lobby_id].length - 1]
      round = database.Spiel.runden_id[round][database.Spiel.runden_id[round].length - 1]+1}

      let message = JSON.parse(msg)

      switch(message.type){
        
        case "start_round":
          console.log("new round starting");
          round = database.Runden.runden_id.length
          database.Lobby.aktive_spieler[lobby_id] = undefined
          database.Lobby.open[lobby_id] = false

          let new_game = database.Lobby.spielID[lobby_id][database.Lobby.spielID[lobby_id].length-1]

          let new_round = database.Runden.runden_id.length

          database.Runden.runden_id.push(new_round)
          database.Spiel.runden_id[new_game].push(new_round)
          database.Runden.angebot_id.push([])

          all_players = database.Lobby.spieler_id[lobby_id]

          database.Lobby.gamestate[lobby_id] = "new_round" // updates the gamestate

          for (var i = 0; i < all_players.length; i++) {
            var n = all_players[i];

            database.Spieler.websocket[n].send(JSON.stringify({ // sends nesseccary info to players
              type: 'new_round',
              data:{
                game: database.Lobby.spielID[lobby_id].length,
                round: database.Spiel.runden_id[new_game].length,
                name: database.Spiel.spiel_name[database.Spiel.spiel_id.length-1]
              }
            }))
            database.Spieler.websocket[n].send(JSON.stringify({
              type: "place_offer"
            }))
        }

        database.Lobby.host_websocket[lobby_id].send(JSON.stringify({ // sends info to the host
          type: 'new_round',
          data:{
            game: database.Lobby.spielID[lobby_id].length,
            round: database.Spiel.runden_id[new_game].length,
            name: database.Spiel.spiel_name[database.Spiel.spiel_id.length-1]
          }
        }))
        
        database.Lobby.host_websocket[lobby_id].send(JSON.stringify({ 
          type: "total_players",
          data: {
            amount: database.Lobby.spieler_id[lobby_id].length
          }
        }))
        
          break
        case "crash": // case for testing
          console.log(hello)
          break
        case "start_game":
          console.log("new game starting");
          round = database.Runden.runden_id.length
          database.Lobby.aktive_spieler[lobby_id] = undefined // resets active players if skip has previously been used
          database.Lobby.open[lobby_id] = false

          database.Lobby.gamestate[lobby_id] = "new_round" // prepares database for new game
          let game_id = database.Spiel.spiel_id.length
          database.Spiel.runden_id.push([])
          database.Spiel.spiel_id.push(game_id)
          database.Lobby.spielID[lobby_id].push(game_id)
          database.Runden.runden_id.push(round)
          database.Spiel.runden_id[game_id].push(round)
          database.Runden.angebot_id.push([])
          database.Spiel.spiel_name.push(message.data.name)
          
          let game = database.Lobby.spielID[lobby_id][database.Lobby.spielID[lobby_id].length-1]

          all_players = database.Lobby.spieler_id[lobby_id]

          for (var i = 0; i < all_players.length; i++) {
            var n = all_players[i];
            database.Spieler.websocket[n].send(JSON.stringify({
              type: 'new_round',
              data:{
                game: database.Lobby.spielID[lobby_id].length,
                round: database.Spiel.runden_id[game].length,
                name: database.Spiel.spiel_name[game_id]
              }
            }))
          database.Spieler.websocket[n].send(JSON.stringify({ 
            type: "place_offer"
          }))
        }
          database.Lobby.host_websocket[lobby_id].send(JSON.stringify({
            type: 'new_round',
            data:{
              game: database.Lobby.spielID[lobby_id].length,
              round: database.Spiel.runden_id[game].length,
              name: message.data.name
            }
          }))
          database.Lobby.host_websocket[lobby_id].send(JSON.stringify({ 
            type: "total_players",
            data: {
              amount: database.Lobby.spieler_id[lobby_id].length
            }
          }))
          
          break
        case "offer":
          if([0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100].includes(message.data.amount)){ // finds out wheather the offer is valid
            console.log("valid offer has been sent");
            database.Lobby.gamestate[lobby_id] = "offer"
            offer = database.Angebote.angebot_id.length
            database.Runden.angebot_id[round-1].push(database.Angebote.angebot_id.length)
            database.Angebote.angebot_id.push(database.Angebote.angebot_id.length)
            database.Angebote.angebot_summe.push(JSON.parse(msg).data.amount)
            database.Angebote.angebot_geber.push(player_id)
            
            all_players = database.Lobby.spieler_id[lobby_id]
            database.Lobby.host_websocket[lobby_id].send(JSON.stringify({ // sends the offer amount to the host
              type: 'new_offer',
              data:{
                amount:message.data.amount
              }
            }))
            amount = message.data.amount

            if(database.Lobby.spieler_id[lobby_id].length!=database.Runden.angebot_id[round-1].length){
              ws.send(JSON.stringify({
                type: "wait"
              }))
              this_offer = "a"
            }else{
              database.Lobby.gamestate[lobby_id] = "answer_offer" // updates gamestate
              let players_to_shuffle = []
              temp = []
              database.Runden.angebot_id[round-1].forEach(function(element) {
                  players_to_shuffle.push(database.Angebote.angebot_geber[element])
              })

              players_to_shuffle = shuffle(players_to_shuffle) // players to shuffle get shuffled
              players_to_shuffle.forEach(function(element) {
                database.Angebote.angebot_nehmer.push(element)
                }
              )
              //alle angebot_IDs der Runde 
              let angebote
              angebote = []
              angebote = database.Runden.angebot_id[round-1]

              //die vermischten angebot_geber werden in die angebot_nehmer gefüllt
              for (var i = 0; i < players_to_shuffle.length; i++) {
                database.Angebote.angebot_nehmer[angebote[i]] = players_to_shuffle[i]
              }

              for (var i = 0; i < players_to_shuffle.length; i++) {
                var n = players_to_shuffle[i];
                database.Spieler.websocket[n].send(JSON.stringify({ 
                type: "answer_offer",
                data: {
                  amount: database.Angebote.angebot_summe[angebote[i]]
                }
              }))}
            }
          }else{
          ws.send(JSON.stringify({ // in case of bad offer
            type: "place_offer",
            data: {
              error: "Ungültiges Angebot"
            }
          }))}

          
        
          break
        case "accept_offer":
          console.log("offer accepted");

          database.Angebote.angebot_angenommen[database.Angebote.angebot_nehmer.lastIndexOf(player_id)] = true // updates database
          
          let aktuelle_angebote = database.Runden.angebot_id[round-1]
          aktuelle_angebote.forEach(function(element){
            if(database.Angebote.angebot_nehmer[element]==player_id){
              this_offer = element
            }
          })
            //sendet dem Spieler "wait" und dem Lehrer die Daten
            ws.send(JSON.stringify({
              type: "wait"
            }))
            database.Lobby.host_websocket[lobby_id].send(JSON.stringify({
              type:"offer_response",
              data:{
                amount: database.Angebote.angebot_summe[this_offer],
                accepted: true,
              }}))

            send_final(round)



          break
          case "decline_offer": 
            
            database.Angebote.angebot_angenommen[database.Angebote.angebot_nehmer.lastIndexOf(player_id)] = false;
            
          let aktuelle_angebote2 = database.Runden.angebot_id[round-1]
          let dieses_angebot2
          aktuelle_angebote2.forEach(function(element){
            if(database.Angebote.angebot_nehmer[element]==player_id){
              dieses_angebot2 = element
            }
          })
          
          ws.send(JSON.stringify({
            type: "wait"
          }))
          database.Lobby.host_websocket[lobby_id].send(JSON.stringify({
            type:"offer_response",
            data:{
              amount:database.Angebote.angebot_summe[dieses_angebot2],
              accepted: false
            }
          }))

          send_final(round)
          


          break
          case "skip":


          
            if(ws === database.Lobby.host_websocket){

              return
            }



            switch(database.Lobby.gamestate[lobby_id]){
              case "offer":
                database.Lobby.gamestate[lobby_id] = "answer_offer"
                


                let players_to_shuffle=[]
                players_to_shuffle = []
                database.Runden.angebot_id[round-1].forEach(function(element) {
                  players_to_shuffle.push(database.Angebote.angebot_geber[element])
                  }
                )
                let slow_players
                let every_player
                slow_players = []
                for(var i = 0; i < database.Lobby.spieler_id[lobby_id].length; i++){
                  every_player = database.Lobby.spieler_id[lobby_id][i]
                  if(!players_to_shuffle.includes(every_player)){
                    slow_players.push(every_player)
                  }
                }
              
              
                players_to_shuffle = shuffle(players_to_shuffle)
                players_to_shuffle.forEach(function(element) {
                  database.Angebote.angebot_nehmer.push(element)
                  }
                )
                let offer
                offer = []
                offer = database.Runden.angebot_id[round-1]
                
                
                for (var i = 0; i < players_to_shuffle.length; i++) {
                  database.Angebote.angebot_nehmer[offer[i]] = players_to_shuffle[i]
                }
              
                for (var i = 0; i < players_to_shuffle.length; i++) {
                  var n = players_to_shuffle[i];
                  database.Spieler.websocket[n].send(JSON.stringify({
                  type: "answer_offer",
                  data: {
                    amount: database.Angebote.angebot_summe[offer[i]]
                  }
                }))}
                for (var i = 0; i < slow_players.length; i++) {
                  var n = slow_players[i];
                  database.Spieler.websocket[n].send(JSON.stringify({ 
                  type: "wait"
                }))}
                database.Lobby.host_websocket[lobby_id].send(JSON.stringify({ 
                  type: "total_players",
                  data: {
                    amount: players_to_shuffle.length
                  }
                }))
                database.Lobby.aktive_spieler[lobby_id] = players_to_shuffle.length
          

              break
              case "answer_offer":
              console.log("answer_offer skip")
              for (var i = 0; i < database.Lobby.spieler_id[lobby_id].length; i++) { // sends everyone a wait
                var n = database.Lobby.spieler_id[lobby_id][i];
                database.Spieler.websocket[n].send(JSON.stringify({ 
                type: "wait"
              }))}

              send_final(round, "key") // sends all the players whos offers got answered the answeres

              break
            }
          

          break
          case ("exit"):
            
            for (var i = 0; i < database.Lobby.spieler_id[lobby_id].length; i++) { // lets everyone know the games are over
              var g = database.Lobby.spieler_id[lobby_id][i];
              database.Spieler.websocket[g].send(JSON.stringify({ 
              type: "exit"
            }))}
            database.Lobby.lobby_kennwort[lobby_id] = undefined
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