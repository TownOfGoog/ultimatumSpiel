import request from 'supertest';
import { startExpress } from './server.js';
import { Lobby_tester } from './lobby_tester.js';

const PORT = 9090;
let app
let agent;
let agent2
let cookie
let lobbyCode;

beforeAll((done) => {
  console.log('starting server...');
  app = startExpress().listen(PORT, () => {
    console.log('server running on port '+ PORT);
  })
  agent = request.agent(app);
  done()
})

afterAll(() => {
  console.log('closing server...');
  app.close();
});

describe('Teste Endpunkte', () => { 
  
  test('Registration vom Benutzer «» mit Passwort «» (leer lassen)', done => {
    agent
      .post('/register')
      .send({ name: '', password: '' })
      .expect(400)
      .end(function(err, res) {
        if (err) return done(err);
        //save the cookie given from the first ever request.
        cookie = res.headers['set-cookie'][0]
        if (res.body !== 'Fehlende Anmeldedaten') return done(new Error(`Got ${res.body} instead of 'Fehlende Anmeldedaten'`));
        done()
      });     
  })

  test('Registration vom Benutzer «Test» mit Passwort «geheim»', done => {
    agent
      .post('/register')
      .send({ name: 'Test', password: 'geheim' })
      .expect(400, `"Passwort muss mindestens 7 Zeichen lang sein"`, done)
  })
  
  test('Registration vom Benutzer «Test» mit Passwort «supergeheim»', done => {
    agent
      .post('/register')
      .send({ name: 'Test', password: 'supergeheim' })
      .expect(200, `"Test"`, done)
  })
  
  test('Ist Benutzer eingeloggt?', done => {
    agent
    .get('/check_login')
    .expect(200, `"Test"`, done)
  })  
    
  test('Logout vom Benutzer', done => {
    agent
    .get('/logout')
    .expect(200, `"Abgemeldet"`, done)
  })
  
  test('Logout vom Benutzer (erneut)', done => {
    agent
    .get('/logout')
    .expect(200, `"Abgemeldet"`, done)
  })

  test('Ist Benutzer eingeloggt?', done => {
    agent
    .get('/check_login')
    .expect(401, `"Nicht angemeldet"`, done)
  })
  
  test('Anonymer Benutzer erstellt eine Lobby', done => {
    agent
    .post('/lobby/create')
    .send({ name: 'J3a' })
    .expect(401, `"Nicht angemeldet"`, done)
  })

  test('Registration vom Benutzer «Test» mit Passwort «supergeheim» (erneut)', done => {
    agent
      .post('/register')
      .send({ name: 'Test', password: 'supergeheim' })
      .expect(409, `"Benutzername bereits vergeben"`, done)
  })

  test('Login vom Benutzer «Test» mit Passwort «1234» (falsches Passwort)', done => {
    agent
      .post('/login')
      .send({ name: 'Test', password: '1234' })
      .expect(401, `"Falsche Anmeldedaten, übrige Versuche: 2"`, done)
  })

  test('Login vom Benutzer «» mit Passwort «» (leer lassen)', done => {
    agent
      .post('/login')
      .send({ name: '', password: '1' })
      .expect(400, `"Fehlende Anmeldedaten"`, done)
  })

  test('Login vom Benutzer «Test» mit Passwort «supergeheim»', done => {
    agent
      .post('/login')
      .send({ name: 'Test', password: 'supergeheim' })
      .expect(200, `"Test"`, done)
  })

  test('Benutzer erstellt eine Lobby mit Namen «J3a»', done => {
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

describe('Teste simple', () => {
  let lobby;

  beforeAll((done) => {
    lobby = new Lobby_tester(`localhost:${PORT}`, lobbyCode)
    done()
  });

  afterAll((done) => {
    console.log('disconnecting players...');
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
    lobby.player(1).expect_message([{ type: 'wait' }])
    lobby.player(2).expect_message([{ type: 'wait' }, { type: 'final', data: { accepted: false } }])  
    lobby.host.expect_message(lobby.no_message_condition)
    lobby.host.send({ type: 'skip' }, done);
  })
  test('Host | Schliesst die Lobby', done => {
    lobby.player(1).expect_message([{ type: 'exit' }])
    lobby.player(2).expect_message([{ type: 'exit' }])
    lobby.host.expect_message(lobby.no_message_condition)
    lobby.host.send({ type: 'exit' }, done);
  })  
  test('Host (Test) | Verlässt die Lobby', done => {
    lobby.player(1).expect_message([{ type: 'exit' }])
    lobby.player(2).expect_message([{ type: 'exit' }])

    lobby.host.expect_message(lobby.no_message_condition)
    lobby.host.disconnect(done)
  })   
})

describe('Teste ausführlich', () => {
  let lobby;
  beforeAll((done) => {
    //create another lobby
    agent2 = request.agent(app);
    
    agent2
      .post('/register')
      .send({ name: 'Test2', password: 'supergeheim' })
      .expect(200)
      .end(function(err, res) {
        if (err) return done(err);
        //save the cookie given from the first ever request.
        cookie = res.headers['set-cookie'][0]
        if (res.body !== 'Test2') return done(new Error(`Got ${res.body} instead of 'Test2'`));
              
        agent
          .post('/lobby/create')
          .send({ name: 'J3a' })
          .expect(200)
          .end(function(err, res) {
            if (err) return done(err);
            if (parseInt(res.body) >= 10000 && parseInt(res.body) <= 99999) {
              lobbyCode = res.body
              lobby = new Lobby_tester(`localhost:${PORT}`, lobbyCode)
              done()
            } else {
              done(new Error(`Got ${res.body} instead of a 5-digit number`));
            }
          });
      });
  })
  
  afterAll((done) => {
    console.log('disconnecting players...');
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

  test('Neuer Spieler 3 |	Verbindet sich mit der Lobby', done => {
    lobby.player(3).expect_message([{ type: 'wait', data: { class: 'J3a' } }]);

    lobby.host.expect_message([{ type: 'new_player' }]);

    lobby.player(3).connect(done);
  })

  test('Neuer Spieler 4 |	Verbindet sich mit der Lobby', done => {
    lobby.player(4).expect_message([{ type: 'wait', data: { class: 'J3a' } }]);

    lobby.host.expect_message([{ type: 'new_player' }]);

    lobby.player(4).connect(done);
  })

  test('Neuer Spieler 5 |	Verbindet sich mit der Lobby', done => {
    lobby.player(5).expect_message([{ type: 'wait', data: { class: 'J3a' } }]);

    lobby.host.expect_message([{ type: 'new_player' }]);

    lobby.player(5).connect(done);
  })

  test('Neuer Spieler 6 |	Verbindet sich mit der Lobby', done => {
    lobby.player(6).expect_message([{ type: 'wait', data: { class: 'J3a' } }]);

    lobby.host.expect_message([{ type: 'new_player' }]);

    lobby.player(6).connect(done);
  })

  test('Neuer Spieler 7 |	Verbindet sich mit der Lobby', done => {
    lobby.player(7).expect_message([{ type: 'wait', data: { class: 'J3a' } }]);

    lobby.host.expect_message([{ type: 'new_player' }]);

    lobby.player(7).connect(done);
  })

  test('Spieler 7	| Verlässt Lobby, bevor das Spiel beginnt.', done => {
    lobby.player(7).expect_message( lobby.no_message_condition );

    lobby.host.expect_message([{ type: 'total_players', data: { amount: 6 } }]);

    lobby.player(7).disconnect(done);
  })
  
  test('Host | Startet neues Spiel', done => {
    lobby.all_players().forEach(player => player.expect_message([
      {
        type: 'new_round',
        data: {
          game: 1,
          round: 1,
          name: ''
        }
      },
      { type: 'place_offer' }
    ]));


    lobby.host.expect_message([
      {
        type: 'new_round',
        data: {
          game: 1,
          round: 1,
          name: ''
        }
      },
      { type: 'total_players', data: { amount: 6 } }
    ])

    lobby.host.send({ type: 'start_game', data: { name: '' } }, done);
  })

  test('Spieler 1	| Verlässt Lobby, bevor er ein Angebot abgibt.', done => {
    lobby.player(1).expect_message(
      lobby.no_message_condition
    );
    lobby.host.expect_message([{ type: 'total_players', data: { amount: 5 } }])
    lobby.player(1).disconnect(done);
  })

  test('Spieler 2	| Vergibt 10 Geld', done => {
    lobby.player(2).expect_message([{ type: 'wait' }])
    lobby.host.expect_message([{ type: 'new_offer', data: { amount: 10 } }])
    lobby.player(2).send({ type: 'offer', data: { amount: 10 } }, done);
  })

  test('Spieler 3	| Vergibt 10 Geld', done => {
    lobby.player(3).expect_message([{ type: 'wait' }])
    lobby.host.expect_message([{ type: 'new_offer', data: { amount: 10 } }])
    lobby.player(3).send({ type: 'offer', data: { amount: 10 } }, done);
  })

  test('Spieler 4	| Vergibt 0 Geld', done => {
    lobby.player(4).expect_message([{ type: 'wait' }])
    lobby.host.expect_message([{ type: 'new_offer', data: { amount: 0 } }])
    lobby.player(4).send({ type: 'offer', data: { amount: 0 } }, done);
  })

  test('Spieler 5	| Vergibt 100 Geld', done => {
    lobby.player(5).expect_message([{ type: 'wait' }])
    lobby.host.expect_message([{ type: 'new_offer', data: { amount: 100 } }])
    lobby.player(5).send({ type: 'offer', data: { amount: 100 } }, done);
  })

  test('Spieler 6	| Vergibt 999 Geld (manipuliert)', done => {
    lobby.player(6).expect_message([{ type: 'place_offer', data: { error: 'Ungültiges Angebot'} }])
    lobby.host.expect_message(lobby.no_message_condition)
    lobby.player(6).send({ type: 'offer', data: { amount: 999 } }, done);
  })

  test('Spieler 3 | Verlässt Lobby, nachdem er ein Angebot gibt.', done => {
    lobby.player(3).expect_message(lobby.no_message_condition)
    lobby.host.expect_message([
      {
        type: 'total_players',
        data: {
          amount: 4
        }
      },
      {
        type: 'undo_offer',
        data: {
          amount: 10
        }
      }
    ])
    lobby.player(3).disconnect(done);
  })

  test('Spieler 6	| Verlässt Lobby, bevor er ein Angebot gibt.', done => {
    //on player 6 leave, the offers will be distributed to the remaining players, so we have to test them here
    lobby.player(2).expect_message([{ type: 'answer_offer', data: { amount: 100 } }])
    lobby.player(4).expect_message([{ type: 'answer_offer', data: { amount: 10 } }])
    lobby.player(5).expect_message([{ type: 'answer_offer', data: { amount: 0 } }])
    lobby.player(6).expect_message(lobby.no_message_condition)
    lobby.host.expect_message([{ type: 'total_players', data: { amount: 3 } }])

    lobby.player(6).disconnect(done);
  })

  test('[System] | Alle haben ein Angebot gegeben (3 Spieler sind übrig). Vermische Angebote…', done => {
    //cant test messages after they have been sent. (they are tested in the previous test)
    done()
  })

  test('Spieler 2	| Verlässt Lobby, bevor er eine Entscheidung trifft.', done => {
    // lobby.player(2).expect_message([{ type: 'wait' }])
    // lobby.host.expect_message([{ type: 'offer_response', data: { amount: 100, accepted: false } }])
    // lobby.player(2).send({ type: 'decline_offer', data: { } }, done);
    lobby.player(2).expect_message(lobby.no_message_condition)
    lobby.host.expect_message([{ type: 'total_players', data: { amount: 2 } }])
    lobby.player(2).disconnect(done);
  })

  test('Spieler 4	| Lehnt Angebot 10 ab.', done => {
    lobby.player(4).expect_message([{ type: 'wait' }])
    lobby.host.expect_message([{ type: 'offer_response', data: { amount: 10, accepted: false } }])
    lobby.player(4).send({ type: 'decline_offer', data: { } }, done);
  })
  
  test('Spieler 4 | Verlässt Lobby, nachdem er eine Entscheidung trifft.', done => {
    lobby.player(4).expect_message(lobby.no_message_condition)
    lobby.host.expect_message(lobby.no_message_condition)
    lobby.player(4).disconnect(done);
  })
  
  test('Spieler 5 | Lehnt Angebot 0 ab.', done => {
    
    lobby.player(4).expect_message([{ type: 'final', data: { accepted: false } }])
    lobby.player(5).expect_message([{ type: 'wait' }, { type: 'final', data: { accepted: false } }])
    lobby.host.expect_message([{ type: 'offer_response', data: { amount: 0, accepted: false } }])
    lobby.player(5).send({ type: 'decline_offer', data: { } }, done);
  })
  
  test('[System] | Alle haben auf ein Angebot reagiert. Warte Entscheidung vom Host', done => {
    //we are waiting for the host to continue, nothing happens here
    done()
  })

  test('Host | Startet neues Spiel mit Namen', done => {

    lobby.player(5).expect_message([
      {
        type: 'new_round',
        data: {
          game: 2,
          round: 1,
          name: 'Geerbtes Geld'
        }
      },
      { type: 'place_offer' }
    ]);


    lobby.host.expect_message([
      {
        type: 'new_round',
        data: {
          game: 2,
          round: 1,
          name: 'Geerbtes Geld'
        }
      },
      { type: 'total_players', data: { amount: 1 } }
    ])

    lobby.host.send({ type: 'start_game', data: { name: 'Geerbtes Geld' } }, done);

  })

  test('Spieler 5 | Vergibt 70 Geld', done => {
    lobby.player(5).expect_message([{ type: 'answer_offer', data: { amount: 70 } }])
    lobby.host.expect_message([{ type: 'new_offer', data: { amount: 70 } }])
    lobby.player(5).send({ type: 'offer', data: { amount: 70 } }, done);
  })

  test('[System] | haben ein Angebot gegeben (1 Spieler ist übrig) vermische Angebote…', done => {
    //cant test messages after they have been sent. (they are tested in the previous test)
    done()
  
  })
})