import express from "express"
import expressWs from "express-ws"
import session from "express-session" 
import crypto from 'crypto'
import path from "path"
import { close } from './close.js';
import { getLobby } from './datenbank_functions.js';
import { getHost } from './datenbank_functions.js';
import { getGame } from './datenbank_functions.js';
import { getRound } from './datenbank_functions.js';
import { getOffer } from './datenbank_functions.js';
import { getPlayer } from './datenbank_functions.js';
import { setLobby } from './datenbank_functions.js';
import { setRound } from './datenbank_functions.js';
import { setOffer } from './datenbank_functions.js';
import { createHost } from './datenbank_functions.js';
import { send_final } from './datenbank_functions.js';
import { createLobby } from './datenbank_functions.js';
import { createPlayer } from './datenbank_functions.js';
import { evaluate_offer } from './datenbank_functions.js';
import { offer } from './offer.js';
import { create_new_game } from "./new_round.js"
import { send_new_round_info } from "./new_round.js"



function shuffle(array) {
  let n = array[0]
  array.shift()
  array.push(n)
  return array
}






//express
export function startExpress() {
  var app = express();
  var expressWss = expressWs(app);
  //Wss 
  app.use(express.static(path.join(path.resolve('.'), 'frontend', 'build')));
  

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



function checkLoginAttempts(req, res, next) {
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

    
    let host = getHost()
    const HostID = host.username.indexOf(req.body.name);
    //checkt ob das Passwort existiert und ob es mit dem echten verschlüsselten übereinstimmt
    if (HostID !== -1 && crypto.createHash('sha256').update(req.body.password).digest('hex') === host.password[HostID]) {//Checks if Password exists and if it corresponds with the real Password
        req.session.failedLoginAttempts = 0;
        req.session.user_id = host.HostID[HostID];

        return res.status(200).json(host.username[HostID]);
    } else { //if something is wrong with the Password LoginAttempts gets altered
        if (!req.session.failedLoginAttempts) {
            req.session.failedLoginAttempts = 1;
        } else {
            req.session.failedLoginAttempts++;
        }

        const remainingAttempts = MAX_LOGIN_ATTEMPTS - req.session.failedLoginAttempts;
        if (req.session.failedLoginAttempts >= MAX_LOGIN_ATTEMPTS) { //checks if any LoginAttempts remain
            req.session.bufferPeriod = Date.now() + BUFFER_PERIOD_DURATION;
            return res.status(401).json(`Sie haben die maximalen Anmeldeversuche erreicht. Bitte versuchen Sie es in 5 Minuten erneut.`);
        }

        return res.status(401).json(`Falsche Anmeldedaten, übrige Versuche: ${remainingAttempts}`); //sends how many LoginAttempts remain if password is wrong
    }
});

app.post("/register", (req, res) => {
  let host = getHost()
    if (!req.body.name || !req.body.password) {// Checks if data is missing
        return res.status(400).json("Fehlende Anmeldedaten");
    }
    if (host.username.includes(req.body.name)) {// Checks if username is already taken
        return res.status(409).json("Benutzername bereits vergeben");
    }
    if (req.body.password.length < 7){//
      return res.status(400).json("Passwort muss mindestens 7 Zeichen lang sein")
    }

    createHost(req.body.name, req.body.password)//creates a new Host

    const HostID = host.username.indexOf(req.body.name); // gets the ID of the newly created host
    req.session.user_id = host.HostID[HostID]; // inserts the HostID into the session
    
    res.status(200).json(req.body.name);
});

app.post("/lobby/create", (req, res) => { 
    if (req.session.user_id !== undefined && req.session.cookie.maxAge >Date.now()){

    let newCode = Math.floor(Math.random() * 90000) + 10000 //generates a new Lobbycode

    let lobby = getLobby()
    console.log(getLobby())
    lobby.lobbycode.push(newCode) //saves the Lobbycode for later use
    setLobby(lobby)

    res.status(200).json(newCode) // sends the code to the Frontend

    createLobby(req.session.user_id, req.body.name) //Creates new Lobby
    console.log(req.body.name)
  }else{
    res.status(401).json("Nicht angemeldet")
  }
  })

  
  app.get("/check_login", (req, res) =>{
  if(req.session.user_id === undefined){ //checks if user is logged in
    res.status(401).json("Nicht angemeldet")
  } else {
    let host = getHost()
    res.status(200).json(host.username[req.session.user_id])
  } 
  })

  app.get('/logout', (req, res) => {
    delete req.session.user_id //loggs the User out by deleting the HostID out of their session
    res.status(200).json('Abgemeldet')
  })
   
  app.ws('/lobby/:lobby', function(ws, req) {  
    console.log("trying to connect")
    let lobbycode //initiates relevant Variables
    let round
    let player_id
    let this_offer
    let player_offer
    let lobby
    let game
    let players
    let rounds
    let current_game
    let offers
    let offer_info
    
    lobby = getLobby()
    if(lobby.lobbycode.includes(parseInt(req.params.lobby))){ //verifies the code entered by the user
      lobbycode = lobby.lobbycode.indexOf(parseInt(req.params.lobby)) // sets variable lobbycode for easy use
      lobby.open[lobbycode] == true // this allows users to joint the lobby
      setLobby(lobby)
      console.log("success")
    } else { // if the lobbycode entered by the user did not exist theire connection gets cut
      console.log("wrong code from player")
      ws.close()
      return
    }

    lobby.open[lobbycode]==true
    
    if(lobby.host_websocket[lobbycode] == undefined){ // counter will only be 1 for the host
      
      lobby.host_websocket.push(ws)
      console.log("Host created lobby")

    }
    lobby.gamestate[lobbycode] = "pre" // "pre" signals that no game has started jet
    setLobby(lobby)
    
    console.log(ws !== lobby.host_websocket[lobbycode]&&lobby.open[lobbycode]===true,ws !== lobby.host_websocket[lobbycode],lobby.open[lobbycode]===true)
    if(ws !== lobby.host_websocket[lobbycode]&&lobby.open[lobbycode]===true){ // checks if lobby is still open for entry and if the user is not the host
      console.log("Player has joined ")

      player_id = createPlayer(ws, lobbycode) //creates new player
      
    }
    
    ws.on("close", function(msg) {
      close(send_final, lobbycode, player_id, player_offer, offer_info, this_offer, shuffle, ws)
    })
    let players_to_process

    ws.on("message", function(msg) {
      try{      
        let message = JSON.parse(msg)

        if(message.type !== undefined){

      switch(message.type){
        case "start_round":
          lobby = getLobby()
          rounds = getRound()
          game = getGame()
          players = getPlayer()
          round = rounds.RoundID.length
          
          create_new_game(lobbycode) 

          current_game = lobby.GameID[lobbycode][lobby.GameID[lobbycode].length-1] //finds out the current game
          
          lobby.gamestate[lobbycode] = "new_round" // changes the gamestate to signal a fresh round starting
          
          setLobby(lobby)
          setRound(rounds)
          players_to_process = lobby.PlayerID[lobbycode]
          
          send_new_round_info (lobby.GameID[lobbycode].length, game.RoundID[current_game].length, game.game_name[game.GameID.length-1], lobby, players, players_to_process, lobbycode)
        
          break
        case "crash": // case for testing purposes
          console.log(hallo) // log for testing purposes
          break
        case "start_game":
          lobby = getLobby()
          rounds = getRound()
          game = getGame()
          players = getPlayer()

          round = rounds.RoundID.length
          current_game = game.GameID.length
          create_new_game(lobbycode, message, "key")

          players_to_process = lobby.PlayerID[lobbycode]
          send_new_round_info (lobby.GameID[lobbycode].length, game.RoundID[current_game].length, message.data.name, lobby, players, players_to_process, lobbycode)
          
          break
        case "offer":
          console.log(getLobby().GameID, getGame().RoundID)
          round = getLobby().GameID[lobbycode][getLobby().GameID[lobbycode].length - 1]
          round = getGame().RoundID[round][getGame().RoundID[round].length - 1] +1
          offer_info = "offer given" // saves the info that this websocket has sent an offer
          player_offer = offer(message, round, lobbycode, player_id, ws, shuffle)
        
          break
        case "accept_offer":
          console.log("offer accepted")

          offer_info = evaluate_offer(player_offer, lobbycode, ws, player_id, round, true)

          send_final(round, lobbycode)

          break
        case "decline_offer": 
          console.log("offer declined")

          offer_info = evaluate_offer(player_offer, lobbycode, ws, player_id, round, false)

          send_final(round, lobbycode)

          break
          case "skip":
            lobby = getLobby()
            rounds = getRound()
            game = getGame()
            players = getPlayer()
            offers = getOffer()
          
            if(ws != lobby.host_websocket[lobbycode]){
              return
            }

            switch(lobby.gamestate[lobbycode]){ // when skip is sent, there are many different cases to be differentiated, based on the gamestate
              case "offer":
                
              rounds = getRound()
              offers = getOffer()
              lobby = getLobby()
              players = getPlayer()
              console.log("skipping offer")
              lobby.gamestate[lobbycode] = "answer_offer"
              
              let players_to_be_shuffled=[]

              players_to_be_shuffled = []
              console.log(rounds)
              console.log(rounds.OfferID[round],round)
              rounds.OfferID[round].forEach(function(element) {
                players_to_be_shuffled.push(offers.giver[element]) // finds all the players who managed to give an offer
                }
              )
              let players_too_late
              let everyone
              players_too_late = []
              for(var i = 0; i < lobby.PlayerID[lobbycode].length; i++){
                everyone = lobby.PlayerID[lobbycode][i]
                if(!players_to_be_shuffled.includes(everyone)){ // sorts through the players find, who out of everyone did not manage to give an offer
                  players_too_late.push(everyone)
                }
              }

              players_to_be_shuffled = shuffle(players_to_be_shuffled)
              players_to_be_shuffled.forEach(function(element) {
                offers.reciever.push(element)
                }
              )
              let offers_to_recieve
              offers_to_recieve = []
              offers_to_recieve = rounds.OfferID[round]


              for (var i = 0; i < players_to_be_shuffled.length; i++) {
                offers.reciever[offers_to_recieve[i]] = players_to_be_shuffled[i]
              }

              for (var i = 0; i < players_to_be_shuffled.length; i++) {
                var n = players_to_be_shuffled[i];
                players.websocket[n].send(JSON.stringify({
                type: "answer_offer",
                data: {
                  amount: offers.offer_sum[offers_to_recieve[i]]
                }
              }))}
              for (var i = 0; i < players_too_late.length; i++) {
                var n = players_too_late[i];
                players.websocket[n].send(JSON.stringify({ 
                type: "wait"
              }))}
              lobby.host_websocket[lobbycode].send(JSON.stringify({ 
                type: "total_players",
                data: {
                  amount: players_to_be_shuffled.length
                }
              }))
              lobby.active_players[lobbycode] = players_to_be_shuffled.length // tells us how many players with offers given are left
        
              setLobby(lobby)
              setOffer(offers)
              setRound(rounds)

              break
              case "answer_offer":
              console.log("answer_offer skip")
              for (var i = 0; i < lobby.PlayerID[lobbycode].length; i++) { // sends every player a wait
                var n = lobby.PlayerID[lobbycode][i];
                players.websocket[n].send(JSON.stringify({ 
                type: "wait"
              }))}
                send_final(round, lobbycode, "key") // will let the players know wheather or not theire offers have been accepted
              break
            }
          
          break
          case ("exit"): 
          lobby = getLobby()
          players = getPlayer()
          for (var i = 0; i < lobby.PlayerID[lobbycode].length; i++) { // lets everyone know that no more games will happen 
            var g = lobby.PlayerID[lobbycode][i];
            players.websocket[g].send(JSON.stringify({ 
            type: "exit"
          }))}
          lobby.lobbycode[lobbycode] = undefined // destroys the lobbycode
          setLobby(lobby)
          break
      

        

      }
  }}catch (error) {
    console.log("Error:", error)
  }})
  })

  
  app.get('/*', (req, res, next) => {
    res.sendFile(path.join(path.resolve('.'), 'frontend', 'build', '/index.html'))
  })
  return app
}

startExpress()


