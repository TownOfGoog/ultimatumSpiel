import crypto from 'crypto'

let database = {
    "Lobby":{
      "LobbyID":[],
      "GameID":[[]],
      "HostID":[],
      "PlayerID":[[]],
      "lobbycode":[],
      "name": [],
      "host_websocket":[],
      "gamestate":[],
      "open":[],
      "active_players":[]
    },
    "Host":{
      "HostID":[],
      "username":[],
      "password":[]
    },
    "Game":{
      "GameID":[],
      "game_name":[],
      "RoundID":[[]]
    },
    "Round":{
      "RoundID":[],
      "OfferID":[[]]
    },
    "Offer":{
      "OfferID":[],
      "reciever":[],
      "giver":[],
      "offer_sum":[],
      "offer_accepted":[]
    },
    "Player":{
      "PlayerID":[],
      "websocket":[]
    }
  
  }

  export function getLobby(){
    return database.Lobby
  }
  export function setLobby(value){
    database.Lobby = value
  }

  export function getHost(){
    return database.Host
  }
  export function setHost(value){
    database.Host = value
  }

  export function getGame(){
    return database.Game
  }
  export function setGame(value){
    database.Game = value
  }

  export function getRound(){
    return database.Round
  }
  export function setRound(value){
    database.Round = value
  }

  export function getOffer(){
    return database.Offer
  }
  export function setOffer(value){
    database.Offer = value
  }

  export function getPlayer(){
    return database.Player
  }
  export function setPlayer(value){
    database.Player = value
  }


  export function createHost(name, password){
    database.Host.HostID.push(database.Host.HostID.length);
    database.Host.username.push(name);
    database.Host.password.push(crypto.createHash('sha256').update(password).digest('hex'));
  }

  export function createLobby (host, name) {
    if (name == undefined) {name = ""}
    database.Lobby.LobbyID[database.Lobby.LobbyID.length] = database.Lobby.LobbyID.length
    database.Lobby.HostID.push(database.Host.HostID[host])
    database.Lobby.PlayerID.push([])
    database.Lobby.GameID.push([])
    database.Game.RoundID.push([])
    database.Lobby.open.push(true)
    database.Lobby.name.push(name)
  }

  export function createPlayer (ws, lobbycode) {
    let player = database.Player.PlayerID.length
    database.Player.PlayerID.push(player)
    console.log(database.Player.PlayerID)
    
    database.Player.websocket.push(ws)
    database.Lobby.PlayerID[lobbycode].push(player)
    console.log(database.Lobby.PlayerID[lobbycode])
    console.log(database.Lobby.name[lobbycode])
    ws.send(JSON.stringify({
      type: "wait",
      data: {
        class: database.Lobby.name[lobbycode]
      }
    }))

    database.Lobby.host_websocket[lobbycode].send(JSON.stringify({
      type: 'new_player',
    }))
    return player
  }

  export function send_final(round, key){
    let offer = database.Round.OfferID[round-1]
    console.log(offer, round)
    let reciever = []
    for (var i = 0; i < offer.length; i++) {
      var n = offer[i];
      reciever.push(database.Offer.offer_accepted[n])
    }
    console.log(database.Offer.offer_accepted, !reciever.includes(undefined) || key != undefined)
    console.log(database.Round.OfferID, database.Offer.offer_accepted)
    console.log(reciever)
  
    if(!reciever.includes(undefined) || key != undefined){
      let reciever = []
      let accepted = []
      database.Round.OfferID[round-1].forEach(function(element) {
        reciever.push(database.Offer.reciever[element])
        accepted.push(database.Offer.offer_accepted[element])
        })
        console.log(reciever, accepted, "testtest")
  
        for (var i = 0; i < accepted.length; i++) {
          var n = reciever[i];
          if(accepted[i] != undefined){
          database.Player.websocket[n].send(JSON.stringify({ //wird an den spieler geschickt oder
          type: "final",
          data: {
            accepted:accepted[i]                  
          }
        }))}}
    }
  }

  export function evaluate_offer (player_offer, lobbycode, ws, player_id, round, evaluation){
  let lobby
  let rounds
  let game
  let players
  let offers

  lobby = getLobby()
  rounds = getRound()
  game = getGame()
  players = getPlayer()
  offers = getOffer()
  let offer_info = "offer evaluatede"

    offers.offer_accepted[player_offer] = evaluation
    setOffer(offers)

    let this_offer = rounds.OfferID[round-1]
    this_offer.forEach(function(element){
      if(offers.reciever[element]==player_id){
        this_offer = element
      }
    })

      ws.send(JSON.stringify({
        type: "wait"
      }))
      lobby.host_websocket[lobbycode].send(JSON.stringify({
        type:"offer_response",
        data:{
          amount: offers.offer_sum[this_offer],
          accepted: evaluation,
        }}))
      return offer_info
  }