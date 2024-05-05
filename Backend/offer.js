import { getLobby } from './datenbank_functions.js';
import { getGame } from './datenbank_functions.js';
import { getRound } from './datenbank_functions.js';
import { getOffer } from './datenbank_functions.js';
import { getPlayer } from './datenbank_functions.js';
import { setLobby } from './datenbank_functions.js';
import { setRound } from './datenbank_functions.js';
import { setOffer } from './datenbank_functions.js';


export function offer(message, round, lobbycode, player_id, ws, shuffle){
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
    let amount
    let player_offer
    let players_to_process

    if([0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100].includes(message.data.amount)){
      
    
    let all_offers
    lobby.gamestate[lobbycode] = "offer"
    all_offers = offers.OfferID.length
    player_offer = offers.OfferID.length
    console.log(rounds.OfferID[round-1], round-1)
    console.log(offers.OfferID.length)
    rounds.OfferID[round-1].push(offers.OfferID.length)
    offers.OfferID.push(offers.OfferID.length)
    offers.offer_sum.push(message.data.amount)
    offers.giver.push(player_id)

    setRound(rounds)
    setOffer(offers)

    players_to_process = lobby.PlayerID[lobbycode]
    lobby.host_websocket[lobbycode].send(JSON.stringify({ // lets the host know how many palyers have given an offer
      type: 'new_offer',
      data:{
        amount:message.data.amount
      }
    }))
    amount = message.data.amount

    if(lobby.PlayerID[lobbycode].length!=rounds.OfferID[round-1].length){
      
      
      ws.send(JSON.stringify({
        type: "wait"
        
      }))
    }else{ // happens when everyone has given an offer
      lobby.gamestate[lobbycode] = "answer_offer"
      
      
    let data_to_shuffle = []

    data_to_shuffle = []
    rounds.OfferID[round-1].forEach(function(element) {
      data_to_shuffle.push(offers.giver[element]) // shows in chronological order who gave an offer
      console.log(offers.giver, getOffer().giver)
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
      offers.reciever[every_offer[i]] = data_to_shuffle[i] // updates the database with shuffeled data
    }
    console.log(data_to_shuffle)
    for (var i = 0; i < data_to_shuffle.length; i++) { // itterates through every player
      var n = data_to_shuffle[i];
      players.websocket[n].send(JSON.stringify({ 
      type: "answer_offer",
      data: {
        amount: offers.offer_sum[every_offer[i]] // declares
      }
    }))}
    lobby.gamestate[lobbycode] = "answer_offer"
    setRound(rounds)
    setOffer(offers)
    setLobby(lobby)

    }
    }else{
    
    ws.send(JSON.stringify({ // if the offer given was a bad value the player will be asked to try giving an offer again through this message
      type: "place_offer",
      data: {
        error: "Ungültiges Angebot"
      }
    }))}
    return player_offer
}