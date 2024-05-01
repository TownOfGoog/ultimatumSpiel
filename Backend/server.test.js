// import { startExpress } from "./server.js";
// import express from "express"
// import expressWs from "express-ws"
// import WebSocket from "ws"
// import { conditionWait } from "./util.js";

// var wss
// //wartet bis der server existiert
// wss = await startExpress()

// //macht neuen websocket der client heisst
// var client = new WebSocket("ws://localhost:8080/lobby")
// //erstellt testdatenvariabel
// var testData
// //wartet auf websocket
// await conditionWait(client, client.OPEN)
// console.log(client.readyState)

// //client sendet an server "ho"
// client.send("ho")

// //client fängt an zu hören
// client.onmessage = (event) => {
//     //wenn client etwas gehört dann passiert:
//     console.log(2)
//     //speichert die variabeln
//     testData = event.data
//     //schliesst das client
//     client.close()
//     //schliesst den server
//     wss.close()
    
// }


// //wartet auf schliessen 
// await conditionWait(client, client.CLOSED)

 







// test('first test', () => {
//     expect(testData).toBe('s');
//   });



import WebSocket from 'ws';
import request from 'supertest';
import { startExpress } from './server.js';
import { Lobby_tester } from './lobby_tester.js';
const PORT = 9090;
let agent;
let cookie
let lobbyCode;
let ws;
let app

beforeAll((done) => {
  console.log('start');
  app = startExpress().listen(PORT, () => {
    console.log('Server running on port '+ PORT);
  })
  agent = request.agent(app);
  done()
})

afterAll(() => {
  console.log('end');
  app.close();
});

describe('Teste Endpunkte', function() { 
  
  test('Registration vom Benutzer «» mit Passwort «» (leer lassen)', function(done) {
    agent
      .post('/register')
      .send({ name: '', password: '' })
      .expect(400)
      .end(function(err, res) {
        if (err) return done(err);
        cookie = res.headers['set-cookie'][0]
        if (res.body !== 'Fehlende Anmeldedaten') return done(new Error(`Got ${res.body} instead of 'Fehlende Anmeldedaten'`));
        done()
      });     
  })

  test('Registration vom Benutzer «Test» mit Passwort «geheim»', function(done) {
    agent
      .post('/register')
      .send({ name: 'Test', password: 'geheim' })
      .expect(400, `"Passwort muss mindestens 7 Zeichen lang sein"`, done)
  })
  
  test('Registration vom Benutzer «Test» mit Passwort «supergeheim»', function(done) {
    agent
      .post('/register')
      .send({ name: 'Test', password: 'supergeheim' })
      .expect(200, `"Test"`, done)
  })
  
  test('Ist Benutzer eingeloggt?', function(done) {
    agent
    .get('/check_login')
    .expect(200, `"Test"`, done)
  })  
    
  test('Logout vom Benutzer', function(done) {
    agent
    .get('/logout')
    .expect(200, `"Abgemeldet"`, done)
  })
  
  test('Logout vom Benutzer (erneut)', function(done) {
    agent
    .get('/logout')
    .expect(200, `"Abgemeldet"`, done)
  })

  test('Ist Benutzer eingeloggt?', function(done) {
    agent
    .get('/check_login')
    .expect(401, `"Nicht angemeldet"`, done)
  })
  
  test('Anonymer Benutzer erstellt eine Lobby', function(done) {
    agent
    .post('/lobby/create')
    .send({ name: 'J3a' })
    .expect(401, `"Nicht angemeldet"`, done)
  })

  test('Registration vom Benutzer «Test» mit Passwort «supergeheim» (erneut)', function(done) {
    agent
      .post('/register')
      .send({ name: 'Test', password: 'supergeheim' })
      .expect(409, `"Benutzername bereits vergeben"`, done)
  })

  test('Login vom Benutzer «Test» mit Passwort «1234» (falsches Passwort)', function(done) {
    agent
      .post('/login')
      .send({ name: 'Test', password: '1234' })
      .expect(401, `"Falsche Anmeldedaten, übrige Versuche: 2"`, done)
  })

  test('Login vom Benutzer «» mit Passwort «» (leer lassen)', function(done) {
    agent
      .post('/login')
      .send({ name: '', password: '1' })
      .expect(400, `"Fehlende Anmeldedaten"`, done)
  })

  test('Login vom Benutzer «Test» mit Passwort «supergeheim»', function(done) {
    agent
      .post('/login')
      .send({ name: 'Test', password: 'supergeheim' })
      .expect(200, `"Test"`, done)
  })

  test('Benutzer erstellt eine Lobby mit Namen «J3a»', function(done) {
    agent
    .post('/lobby/create')
    .send({ name: 'J3a' })
    .expect(200)
    .end(function(err, res) {
      if (err) return done(err);
      if (parseInt(res.body) >= 10000 && parseInt(res.body) <= 99999) {
        lobbyCode = res.body
        done()
      } else {
        done(new Error(`Got ${res.body} instead of a 5-digit number`));
      }
    });
  })
})

describe('Teste Websocket', function() {
  let lobby;

  beforeAll((done) => {
    lobby = new Lobby_tester(`localhost:${PORT}`, lobbyCode)
    done()
  });

  afterAll((done) => {
    console.log('ending');
    lobby.close();
    setTimeout(() => {
      done()
    }, 50)
  });
  
  test('Host (Test) | Verbindet sich mit der Lobby', done => {
    lobby.host.expect_message( lobby.no_message_condition )

    lobby.host.connect(done, cookie);
  })  
  test('Neuer Spieler 1 | Verbindet sich mit der Lobby', done => {
    lobby.player(1).expect_message([{ type: 'wait', data: { class: 'J3a' } }]);

    lobby.host.expect_message([{ type: 'new_player' }]);

    lobby.player(1).connect(done);
  })
  test('Neuer Spieler 2 |	Verbindet sich mit der Lobby', done => {
    lobby.player(2).expect_message([{ type: 'wait', data: { class: 'J3a' } }]);

    lobby.host.expect_message([{ type: 'new_player' }]);

    lobby.player(2).connect(done);
  })
  test('Host | Startet neues Spiel', done => {
    lobby.player(1).expect_message([
      {
        type: 'new_round',
        data: {
          game: 1,
          round: 1,
          name: ''
        }
      },
      { type: 'place_offer' }
    ]);

    lobby.player(2).expect_message([
      {
        type: 'new_round',
        data: {
          game: 1,
          round: 1,
          name: ''
        }
      },
      { type: 'place_offer' }
    ]);

    lobby.host.expect_message([
      {
        type: 'new_round',
        data: {
          game: 1,
          round: 1,
          name: ''
        }
      },
      { type: 'total_players', data: { amount: 2 } }
    ])

    lobby.host.send({ type: 'start_game', data: { name: '' } }, done);
  })
  test('Spieler 1	| Vergibt 10 Geld', done => {
    lobby.player(1).expect_message([{ type: 'wait' }])
    lobby.host.expect_message([{ type: 'new_offer', data: { amount: 10 } }])
    lobby.player(1).send({ type: 'offer', data: { amount: 10 } }, done);
  })
  test('Spieler 2	| Vergibt 10 Geld', done => {
    lobby.player(1).expect_message([{ type: 'answer_offer', data: { amount: 10 } }])
    lobby.player(2).expect_message([{ type: 'answer_offer', data: { amount: 10 } }])
    lobby.host.expect_message([{ type: 'new_offer', data: { amount: 10 } }])
    lobby.player(2).send({ type: 'offer', data: { amount: 10 } }, done);
  })  
  test('[System] | Alle haben ein Angebot gegeben. Vermische Angebote…', done => {
    //cant test messages after they have been sent. (they are tested in the previous test)
    done()
  })
  test('Spieler 1 | Lehnt Angebot 10 ab.', done => {    
    lobby.player(1).expect_message([{ type: 'wait' }])
    lobby.host.expect_message([{ type: 'offer_response', data: { amount: 10, accepted: false } }])
    lobby.player(1).send({ type: 'decline_offer', data: { } }, done);
  })
  test('Spieler 2 | Lehnt Angebot 10 ab.', done => {    
    lobby.player(1).expect_message([{ type: 'final', data: { accepted: false } }])
    lobby.player(2).expect_message([{ type: 'final', data: { accepted: false } }])
    lobby.host.expect_message([{ type: 'offer_response', data: { amount: 10, accepted: false } }])
    lobby.player(2).send({ type: 'decline_offer', data: { } }, done);
  })
  test('[System] | Alle haben auf ein Angebot reagiert. Warte Entscheidung vom Host…', done => {
    //we are waiting for the host to continue, nothing happens here
    done()
  })
  test('Host | Startet neues Spiel mit Namen', done => {
    lobby.player(1).expect_message([{ type: 'new_round', data: { game: 2, round: 1, name: 'Geerbtes Geld' } }, { type: 'place_offer' }])
    lobby.player(2).expect_message([{ type: 'new_round', data: { game: 2, round: 1, name: 'Geerbtes Geld' } }, { type: 'place_offer' }])
    lobby.host.expect_message([{ type: 'new_round', data: { game: 2, round: 1, name: 'Geerbtes Geld' } }, { type: 'total_players', data: { amount: 2 } }])
    lobby.host.send({ type: 'start_game', data: { name: 'Geerbtes Geld' } }, done);
  })
  test('Spieler 1	Vergibt 70 Geld', done => {
    lobby.player(1).expect_message([{ type: 'wait' }])
    lobby.host.expect_message([{ type: 'new_offer', data: { amount: 70 } }])
    lobby.player(1).send({ type: 'offer', data: { amount: 70 } }, done);
  })
  test('Spieler 2	Vergibt 50 Geld', done => {
    lobby.player(1).expect_message([{ type: 'answer_offer', data: { amount: 50 } }])
    lobby.player(2).expect_message([{ type: 'answer_offer', data: { amount: 70 } }])
    lobby.host.expect_message([{ type: 'new_offer', data: { amount: 50 } }])
    lobby.player(2).send({ type: 'offer', data: { amount: 50 } }, done);
  })
  test('[System] | Alle haben ein Angebot gegeben. Vermische Angebote…', done => {
    //cant test messages after they have been sent. (they are tested in the previous test)
    done()
  })
  test('Spieler 1 | Lehnt Angebot 50 ab.', done => {    
    lobby.player(1).expect_message([{ type: 'wait' }])
    lobby.host.expect_message([{ type: 'offer_response', data: { amount: 50, accepted: false } }])
    lobby.player(1).send({ type: 'decline_offer', data: { } }, done);
  })
  test('Spieler 2 | Nimmt Angebot 70 an', done => {    
    lobby.player(1).expect_message([{ type: 'final', data: { accepted: true } }])
    lobby.player(2).expect_message([{type: 'wait'}, { type: 'final', data: { accepted: false } }])
    lobby.host.expect_message([{ type: 'offer_response', data: { amount: 70, accepted: true } }])
    lobby.player(2).send({ type: 'accept_offer', data: { } }, done);
  })
  test('[System] | Alle haben auf ein Angebot reagiert. Warte Entscheidung vom Host…', done => {
    //we are waiting for the host to continue, nothing happens here
    done()
  })
  test('Host | Startet neue Runde', done => {
    lobby.host.expect_message([ { type: 'total_players', data: { amount: 2 } },{ type: 'new_round', data: { game: 2, round: 2, name: 'Geerbtes Geld' } }])
    lobby.player(1).expect_message([{ type: 'new_round', data: { game: 2, round: 2, name: 'Geerbtes Geld' } }, { type: 'place_offer' }])
    lobby.player(2).expect_message([{ type: 'new_round', data: { game: 2, round: 2, name: 'Geerbtes Geld' } }, { type: 'place_offer' }])
    lobby.host.send({ type: 'start_round' }, done);
  })
  test('Spieler 1 | Vergibt 30 Geld', done => {
    lobby.player(1).expect_message([{ type: 'wait' }])
    lobby.host.expect_message([{ type: 'new_offer', data: { amount: 30 } }])
    lobby.player(1).send({ type: 'offer', data: { amount: 30 } }, done);
  })
  test('Host | Fährt fort, ohne auf Spieler 2 zu warten', done => {
    lobby.player(1).expect_message([{ type: 'answer_offer', data: { amount: 30 } }])
    lobby.player(2).expect_message([{ type: 'wait' }])
    lobby.host.expect_message([{ type: 'total_players', data: { amount: 1 } }])
    lobby.host.send({ type: 'skip' }, done);
  })
  test('Spieler 1 | Nimmt Angebot 30 an', done => {
    lobby.player(1).expect_message([{ type: 'wait' }, { type: 'final', data: { accepted: true } }])
    lobby.host.expect_message([{ type: 'offer_response', data: { amount: 30, accepted: true } }])
    lobby.player(1).send({ type: 'accept_offer', data: { } }, done);
  })  
  test('[System] | haben auf ein Angebot reagiert. Warte Entscheidung vom Host…', done => {
    //we are waiting for the host to continue, nothing happens here
    done()
  })
  test('Host | Startet neues Spiel mit Namen', done => {
    lobby.player(1).expect_message([{ type: 'new_round', data: { game: 3, round: 1, name: 'Auf der Strasse gefunden' } }, { type: 'place_offer' }])
    lobby.player(2).expect_message([{ type: 'new_round', data: { game: 3, round: 1, name: 'Auf der Strasse gefunden' } }, { type: 'place_offer' }])
    lobby.host.expect_message([{ type: 'new_round', data: { game: 3, round: 1, name: 'Auf der Strasse gefunden' } }, { type: 'total_players', data: { amount: 2 } }])
    lobby.host.send({ type: 'start_game', data: { name: 'Auf der Strasse gefunden' } }, done);
  })
  test('Spieler 1	Vergibt 70 Geld', done => {
    lobby.player(1).expect_message([{ type: 'wait' }])
    lobby.host.expect_message([{ type: 'new_offer', data: { amount: 70 } }])
    lobby.player(1).send({ type: 'offer', data: { amount: 70 } }, done);
  })
  test('Spieler 2	Vergibt 50 Geld', done => {
    lobby.player(1).expect_message([{ type: 'answer_offer', data: { amount: 50 } }])
    lobby.player(2).expect_message([{ type: 'answer_offer', data: { amount: 70 } }])
    lobby.host.expect_message([{ type: 'new_offer', data: { amount: 50 } }])
    lobby.player(2).send({ type: 'offer', data: { amount: 50 } }, done);
  })
  test('[System] | Alle haben ein Angebot gegeben. Vermische Angebote…', done => {
    //cant test messages after they have been sent. (they are tested in the previous test)
    done()
  })
  test('Spieler 1 | Lehnt Angebot 50 ab.', done => {    
    lobby.player(1).expect_message([{ type: 'wait' }])
    lobby.host.expect_message([{ type: 'offer_response', data: { amount: 50, accepted: false } }])
    lobby.player(1).send({ type: 'decline_offer', data: { } }, done);
  })
  test('Host | Fährt fort, ohne auf Spieler 2 zu warten', done => {
    lobby.player(2).expect_message([{ type: 'wait' }])
    lobby.host.expect_message([{ type: 'total_players', data: { amount: 1 } }])
    lobby.host.send({ type: 'skip' }, done);
  })
  test('Host | Schliesst die Lobby', done => {
    lobby.player(1).expect_message([{ type: 'exit' }])
    lobby.player(2).expect_message([{ type: 'exit' }])
    lobby.host.expect_message(lobby.no_message_condition)
    lobby.host.send({ type: 'exit' }, done);
  })
})

// nachdem man ein angebot eingereicht hat, und dann leavt, wird das angebot nicht gelöscht.
// das macht vieles kaputter, aber ist glaub ich schlauer
// if(datenbank.Runden.angebot_id[runden].includes(angebot)&&datenbank.Angebote.angebot_angenommen[dieses_angebot]==undefined){
//   datenbank.Runden.angebot_id[runde-1].splice(indexA, 1)
// }}
//vergiss nicht final updates hinzuzufügen

//im case start_round SHICKST DU MIR FüR JEDEN SPIELER NEW_ROUND AM HOTS!?

//bbackend crasht beim skippen im accept/decline phase wegen dem final message
//aber ohne final message geht das skippen ab der 2. runde nicht  