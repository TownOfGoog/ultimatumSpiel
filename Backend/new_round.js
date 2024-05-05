import { getLobby } from './datenbank_functions.js';
import { getGame } from './datenbank_functions.js';
import { getRound } from './datenbank_functions.js';
import { getPlayer } from './datenbank_functions.js';
import { setLobby } from './datenbank_functions.js';
import { setRound } from './datenbank_functions.js';
import { setGame } from './datenbank_functions.js';

export function send_new_round_info (game, round, name, lobby, players, players_to_process, lobbycode) {
    for (var i = 0; i < players_to_process.length; i++) { //iterates through all players to send info
        var n = players_to_process[i];
        players.websocket[n].send(JSON.stringify({
          type: 'new_round',
          data:{
            game: game,
            round: round,
            name: name //as this is the newest game in the database we can simply get the newest game
          }
        }))
        players.websocket[n].send(JSON.stringify({ 
          type: "place_offer"
        }))
      }

    lobby.host_websocket[lobbycode].send(JSON.stringify({
      type: 'new_round',
      data:{
        game: game,
        round: round,
        name: name //as this is the newest game in the database we can simply get the newest game
      }
    }))
    
    lobby.host_websocket[lobbycode].send(JSON.stringify({ 
      type: "total_players",
      data: {
        amount: lobby.PlayerID[lobbycode].length
      }
    }))
}

export function create_new_game(lobbycode, message, key){
    console.log("start round")
        let lobby
        let rounds
        let game
        let players
        let current_game
        
        lobby = getLobby()
        rounds = getRound()
        game = getGame()
        players = getPlayer()
        let round = rounds.RoundID.length

          if (lobby.active_players[lobbycode] != undefined){
            lobby.active_players[lobbycode] = undefined // if player actions have previously been skipped by the host, this line will reinstate, that all players are participateing
          }
          lobby.open[lobbycode] = false //closes the lobby so no more players can join
          lobby.gamestate[lobbycode] = "new_round" // changes the gamestate to signal a fresh round starting
          
          if(key != undefined){ // key is added when starting a new game instead of a new round
            let new_game = game.GameID.length
            
            game.GameID.push(new_game)
            lobby.GameID[lobbycode].push(new_game)
            game.game_name.push(message.data.name)
            game.RoundID.push([])
            
            setGame(game)
        }
        current_game = lobby.GameID[lobbycode][lobby.GameID[lobbycode].length-1] //finds out the current game
        console.log(current_game, game.RoundID)
        rounds.RoundID.push(round) //updates database
        game.RoundID[current_game].push(round)
        rounds.OfferID.push([])
        
          
          setLobby(lobby)
          setRound(rounds)
          
}