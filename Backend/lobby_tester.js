import WebSocket from 'ws';

export class Lobby_tester {
  constructor(address, code) {
    this.address = address;
    this.code = code;

    this.players = [];
    this.websockets = [];
    //fill websockets with 7 null, these will be the clients
    //websocket[0] is the host, and the rest are players, so for example websocket[4] is the 4th player
    for (let i = 0; i < 7; i++) {
      this.websockets.push(null);
    }

    //constants
    this.host = this.player(0);
    this.no_message_condition = [{}];
  }

  connect_player(playernumber, cookie) {
    const ws = new WebSocket(`ws://${this.address}/lobby/${this.code}`,
    cookie ? { headers: { "cookie": cookie } } : {} );

    ws.onopen = () => {
      this.websockets[playernumber] = ws;

      this.websockets[playernumber].onmessage = (msg) => {
        //if the player has already met every condition, but still receives a new message, it is not expected
        let condition = JSON.stringify(this.players[playernumber].message_conditions) === JSON.stringify(this.no_message_condition) ? 0 : this.players[playernumber].message_conditions.length
        if (this.players[playernumber].conditions_met === condition) return this.players[playernumber].done(new Error(`Unerwartete Nachricht ${msg.data} vom Spieler ${playernumber} wird nicht geprüft.`));

        
        console.log(`player ${playernumber} recieved a message: ${msg.data}, the expectation is: ${JSON.stringify(this.players[playernumber].message_conditions)}`)
        if (this.players[playernumber].message_conditions.some(condition => msg.data === JSON.stringify(condition))) {
          console.log(`message ${msg.data} is expected`)
          this.players[playernumber].conditions_met++; //one condition met
          this.players[playernumber].messages.push(msg.data);
        }
        else {
          console.log(`message ${msg.data} is not expected`)
          this.players[playernumber].wrong_messages.push(msg.data);
        } 
      };
    };

    ws.onerror = (error) => {
      this.players[playernumber].done(error);
    }

    ws.onclose = () => {
      this.websockets[playernumber] = null;
      console.log('websocket closed.');
    }
  }

  player(playernumber) {
    //whenever this function is called...
    for (let i = 0; i <= playernumber; i++) {
      //...check if the player already exists, if not, create it
      if (this.players[i] === undefined) {
        this.players[i] = {   
          //variables of each player       
          messages: [],
          wrong_messages: [],
          message_conditions: this.no_message_condition,
          conditions_met: 0, 
          //functions of each player
          connect: (done, cookie=null) => {
            if (!done) throw new Error("done() function is required");
            this.players[i].done = done;
            this.connect_player(i, cookie);
            console.log(`player ${i} connected`)
            this.players[i].ok();
          }, //requires the done() function from jest
          disconnect: (done) => {
            if (!done) throw new Error("done() function is required");
            this.players[i].done = done;
            this.websockets[i].close();
            this.websockets[i] = null;
            console.log(`player ${i} disconnected`);
            this.players[i].ok();
          },
          send: (msg, done) => {            
            if (!done) throw new Error("done() function is required");
            this.players[i].done = done;
            //msg must be an object
            if (typeof msg !== "object") throw new Error("message must be an object");
            this.websockets[i].send(JSON.stringify(msg));
            console.log(`player ${i} sent a message ${JSON.stringify(msg)}`);
            this.players[i].ok();
          },
          expect_message: (message_conditions) => {
            //this function sets an expectation for the player to the specified message(s)
            //conditions are in an array, so the player can meet multiple conditions back to back
            this.players[i].wrong_messages = [];
            this.players[i].messages = [];
            this.players[i].conditions_met = 0;
            this.players[i].message_conditions = message_conditions;
          },
          ok: () => {
            //after a delay, check if all players have met their message conditions to then finally call done()
            setTimeout(() => {
              //error variable to prevent multiple done() calls
              let error = false;
              //doublecheck if every player has met their conditions
              this.players.forEach((player, index) => {
                let condition = JSON.stringify(player.message_conditions) === JSON.stringify(this.no_message_condition) ? 0 : player.message_conditions.length
                // console.log(`player ${index} met ${player.conditions_met} / ${condition} conditions`);
                //if any condition is not met
                if (player.conditions_met !== condition) {
                  player.conditions_met++
                  //and if no messages were sent at all
                  if (player.wrong_messages.length === 0) {
                    if (!error) this.players[i].done(new Error(`Die Nachricht ${JSON.stringify(player.message_conditions)} wurde am Spieler ${index} nie gesendet. Gesendet wurde: ${(player.messages ? player.messages : '[nichts].')}`));
                  } else { 
                    if (!error) this.players[i].done(new Error(`Antwort ${player.wrong_messages} vom Spieler ${index} ist nicht erwartet, erwartet war ${player.message_conditions.length > 1 ? 'eins der folgenden Antworten ' + JSON.stringify(player.message_conditions) : JSON.stringify(player.message_conditions[0])}`));
                  }
                  error = true
                }
              });
              if (!error) { this.players[i].done() }
              //to give time for the server to handle everything properly
            }, 30); 
          },
          done: () => {},
        };
      }
    }

    //so calling lobby.players(2) will return this.players[2]
    return this.players[playernumber];
  }

  close() {
    //close all websockets
    this.websockets.forEach((ws, index) => {
      if (ws !== null) {
        ws.close();
        this.websockets[index] = null;
      }
    });
  }
}