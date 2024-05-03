import { getLobby } from './datenbank_functiones.js';
import { getGame } from './datenbank_functiones.js';
import { getRound } from './datenbank_functiones.js';
import { getOffer } from './datenbank_functiones.js';
import { getPlayer } from './datenbank_functiones.js';
import { setLobby } from './datenbank_functiones.js';
import { setRound } from './datenbank_functiones.js';

export function close (send_final, lobbycode, player_id, player_offer, offer_info, this_offer, shuffle, ws) {
    try{
    let players = getPlayer()
    let rounds = getRound()
    let lobby = getLobby()
    let game = getGame()
    let offers = getOffer()
    let round
        
      if(ws == lobby.host_websocket[lobbycode]){ // if the host leaves
        for (var i = 0; i < lobby.PlayerID[lobbycode].length; i++) {
          var g = lobby.PlayerID[lobbycode][i];
          players.websocket[g].send(JSON.stringify({ 
          type: "exit"
        }))}
        lobby.lobbycode[lobbycode] = undefined      
      }

      let offer
      
      if(ws != lobby.host_websocket[lobbycode]){ // checks if a player left
        
        console.log("player left")
        let index = lobby.PlayerID[lobbycode].indexOf(player_id)
        
        lobby.PlayerID[lobbycode].splice(index,1) // deletes the player from the lobby in the database
        setLobby(lobby)
        console.log(lobby.PlayerID)
        
        if(offer_info != "offer evaluatede" && lobby.gamestate != "answer_offer"){
            lobby.host_websocket[lobbycode].send(JSON.stringify({ 
                type: "total_players",
                data: {
                    amount: (lobby.active_players && lobby.active_players[lobbycode]) ? lobby.active_players[lobbycode] : lobby.PlayerID[lobbycode].length 
                }
            }))
        }

        if(lobby.gamestate[lobbycode]!="pre"){
        round = lobby.GameID[lobbycode][lobby.GameID[lobbycode].length - 1]
        round = game.RoundID[round][game.RoundID[round].length - 1]+1
        
        console.log(offer_info, lobby.gamestate[lobbycode])
          if(offer_info == "offer given" && lobby.gamestate[lobbycode] == "offer"){
            lobby.host_websocket[lobbycode].send(JSON.stringify({ 
                type: "undo_offer",
                data: {
                  amount: offers.offer_sum[player_offer] 
                }
              }))
              rounds.OfferID[round-1].splice(rounds.OfferID[round-1].indexOf(player_offer), 1)
              setRound(rounds)
            }


        if (index !== -1 && lobby.PlayerID[lobbycode][lobby.PlayerID[lobbycode].length - 1]) {
        
          if(rounds.OfferID[lobbycode][offer]!=undefined&&offers.offer_accepted[this_offer]==undefined){
        
          send_final(round, "key")
        
            }
        }

            console.log(rounds.OfferID, rounds.OfferID[round-1], lobby.PlayerID, round)
        if(lobby.PlayerID[lobbycode].length==rounds.OfferID[round-1].length&&lobby.gamestate[lobbycode]=="offer"){
                lobby.gamestate[lobbycode] = "answer_offer"
            
          let data_to_shuffle = []

          data_to_shuffle = []
          rounds.OfferID[round-1].forEach(function(element) {
            data_to_shuffle.push(offers.giver[element]) // shows in chronological order who gave an offer
            }
          )

          data_to_shuffle = shuffle(data_to_shuffle) // shuffles the player's IDs
          data_to_shuffle.forEach(function(element) {
            offers.reciever.push(element) // declares who will recieve the offers
            }
          )
          
          let every_offer
          every_offer = []
          every_offer = rounds.OfferID[round-1]

          for (var i = 0; i < data_to_shuffle.length; i++) {
            offers.offer_accepted[every_offer[i]] = data_to_shuffle[i] // updates the database with shuffeled data
          }

          for (var i = 0; i < data_to_shuffle.length; i++) { // itterates through every player
            var n = data_to_shuffle[i];
            players.websocket[n].send(JSON.stringify({ 
            type: "answer_offer",
            data: {
              amount: offers.offer_sum[every_offer[i]] // declares
            }
          }))}
          lobby.gamestate[lobbycode] = "answer_offer"
        }}
                  
    }

    }catch (error) {
      console.log("Error:", error)
    }
}