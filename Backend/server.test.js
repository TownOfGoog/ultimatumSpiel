import { startExpress } from "./server.js";
import express from "express"
import expressWs from "express-ws"
import WebSocket from "ws"
import { conditionWait } from "./util.js";
import request from 'supertest';
import { expect } from 'chai';


//var wss
////wartet bis der server existiert
//wss = await startExpress()
//
////macht neuen websocket der client heisst
//var client = new WebSocket("ws://localhost:8080/lobby")
////erstellt testdatenvariabel
//var testData
////wartet auf websocket
//await conditionWait(client, client.OPEN)
//console.log(client.readyState)
//
////client sendet an server "ho"
//client.send("ho")
//
////client fängt an zu hören
//client.onmessage = (event) => {
//    //wenn client etwas gehört dann passiert:
//    console.log(2)
//    //speichert die variabeln
//    testData = event.data
//    //schliesst das client
//    client.close()
//    //schliesst den server
//    wss.close()
//    
//}


//wartet auf schliessen 
//await conditionWait(client, client.CLOSED)
function testing(app){

 

//REGISTER TEST


describe('Endpoint Testing', function() {
    console.log(app)
    it('Registration vom Benutzer "Test" mit Passwort "geheim"', function(done) { //1
      request(app)
        .post('/register')
        .send({ name: 'Test', password: 'geheim' })
        .expect(200)
        .end(function(err, res) {
          if (err) return done(err);
          expect(res.body).to.equal('Test');
          done();
        });
    });
  
    it('Registration vom Benutzer "Test" mit Password "geheim" (erneut)', function(done) {//2
      request(app)
        .post('/register')
        .send({ name: 'Test', password: 'geheim' }) 
        .expect(409)
        .end(function(err, res) {
          if (err) return done(err);
          expect(res.body).to.equal('Benutzername bereits Vergeben');
          done();
        });
    }, 10000);
  
    it('Registration vom Benutzer "" mit Password "" (leer lassen)', function(done) {//3
      request(app)
        .post('/register')
        .send({ name: 'Test' }) // Password is missing
        .expect(400)
        .end(function(err, res) {
          if (err) return done(err);
          expect(res.body).to.equal('Fehlende Daten');
          done();
        });
    }, 10000);
  });



  //LOGIN TEST



  describe('POST /login', function() {
    it('Login vom Benutzer "Test" mit Passwort "1234" (falsches Passwort)', function(done) {//4  
        request(app)
        .post('/login')
        .send({ name: 'Test', password: '1234' })
        .expect(400)
        .end(function(err, res) {
          if (err) return done(err);
          expect(res.body).to.equal('Falsche Anmeldedaten');
          done();
        });
    });
  
  
  
    it('Login vom Benutzer "" mit Passwort "" (leer lassen)', function(done) {  //5
        request(app)
        .get("/logout")
        .end(function(err, res) {
          if (err) return done(err);
  
          
          expect(res.body).to.equal("abgemolden");

          request(app)
            .post('/login')
            .send({ name: 'Test', password: '' }) // Password fehlt
            .expect(400)
            .end(function(err, res) {
              if (err) return done(err);
              expect(res.body).to.equal('Fehlende Anmeldedaten');
              done();
            });
        });
    });
  
    it('Login vom Benutzer "Test" mit Passwort "geheim" (leer lassen)', function(done) { //6

        request(app)
        .get("/logout")
        .end(function(err, res) {
          if (err) return done(err);
  
          // Confirm logout was successful
          expect(res.body).to.equal("abgemolden");
  
          // Then, perform the login
          request(app)
            .post('/login')
            .send({ name: 'Test', password: 'geheim' })
            .expect(200)
            .end(function(err, res) {
              if (err) return done(err);
              expect(res.body).to.equal('Test');
              done();
            });
        });
        

    });
  });


  //CHECK LOGIN

  it('Ist Benutzer eingeloggt?', function(done) {// 7
    // Mock login by setting a session userId
    const agent = request.agent(app);
    agent
      .post('/login')
      .send({ name: 'Test', password: 'geheim' })
      .expect(200)
      .end(function(err, res) {
        if (err) return done(err);

        // After setting the session, check login
        agent
          .get('/check_login')
          .expect(200)
          .end(function(err, res) {
            if (err) return done(err);
            expect(res.body).to.be.a('string'); 
            done();
          });
      });
  });


  it('Benutzer erstellt eine Lobby mit Namen "J3a"', function(done) {//8
    // Using an agent to maintain session state
    const agent = request.agent(app);

    // Mock login
    agent
    .post('/login')
    .send({ name: 'Test', password: 'geheim' })
    .expect(200)
    .end(function(err, res) {
      if (err) return done(err);

        // Now attempt to create a lobby
        agent
          .post('/lobby/create')
          .send({ name: 'J3a' }) // Sending necessary body data
          .expect(200)
          .end(function(err, res) {
            if (err) return done(err);
            // Check if the response is a number (lobby code)
            const lobbyCode = parseInt(res.text);
            expect(lobbyCode).to.be.a('number');
            done();
          });
      });
  });




  it('should destroy the session and return the logout message', function(done) { //9
    // Using an agent to maintain session state
    const agent = request.agent(app);

    // Assuming there is a route to login or set session for testing
    agent
    .post('/login')
    .send({ name: 'Test', password: 'geheim' })
    .expect(200)
    .end(function(err, res) {
      if (err) return done(err);

        // After logging in, call logout
        agent
        agent.get('/logout')
        .expect(200)
        .end(function(err, res) {
          if (err) {
            console.error("Error during logout: ", err);
            return done(err);
          }
          expect(res.body).to.equal("abgemolden"); // Corrected to use Chai's to.equal instead of toBe
          done();
        });
      },10000);
  });


  it('should return 200 even if not logged in', function(done) {//10

    const agent = request.agent(app);




        
      agent
      agent.get('/logout')
      .expect(200)
      .end(function(err, res) {
        if (err) {
          console.error("Error during logout: ", err);
          return done(err);
        }
        expect(res.body).to.equal("abgemolden"); // Corrected to use Chai's to.equal instead of toBe
        done();
      })
  });
  


  it('should return 401 when checking if user is logged in', function(done) { //11
    
    const agent = request.agent(app);

       
    agent
    .post('/lobby/create')
    .send({ name: 'New Lobby' }) // Sending necessary body data
    .expect(401)
    .end(function(err, res) {
      if (err) return done(err);
      // Check if the response is a number (lobby code)
      const lobbyCode = parseInt(res.text);
      expect(lobbyCode).to.be.a('number');
      done();
    });
})


    
      it('should fail to create a lobby if no valid session', function(done) {//12

        const agent = request.agent(app);
        request(app)
        .get("/logout")
        .end(function(err, res) {
          if (err) return done(err);

        // Now attempt to create a lobby
        agent
          .post('/lobby/create')
          .send({ name: 'New Lobby'  }) // Sending necessary body data
          .expect(401)
          .end(function(err, res) {
            if (err) return done(err);
            // Check if the response is a number (lobby code)
            const lobbyCode = parseInt(res.text);
            expect(lobbyCode).to.be.a('number');
            done();
        });
      });
    });





    

describe('WebSocket /lobby/:lobby Route Tests', () => {
    let client;
    let serverInstance;


    let lobbyCode
    const agent = request.agent(app);


    let host_ws
    let port = new URL(agent.get("/").url).port;
    let host = request.agent(app);
    let spieler_1
    let spieler_2
    let spieler_3
    let spieler_4
    let spieler_5
    let spieler_6

    function set_host(port, lobbyCode) {
        return new WebSocket("ws://localhost:" + port + "/lobby/" + lobbyCode);
    }
    

    it('Verbinden mit der fünfstelligen Zahl', async () => {
        console.log("111111111111111111111111111")
        // Mock login
        host
        .post('/login')
        .send({ name: 'Test', password: '1234' })
        .expect(200)
        .end(function(err, res) {
          if (err) return done(err);
    
            // Now attempt to create a lobby
            host
              .post('/lobby/create')
              .send({ name: 'New J3a' }) // Sending necessary body data
              .expect(200)
              .end(function(err, res) {
                if (err) return done(err);
                // Check if the response is a number (lobby code)
                lobbyCode = parseInt(res.text);
                expect(lobbyCode).to.be.a('number');
                console.log("111111111111111111111111111")
                
                done();
            });
        });
    });
    
    
    it('Verbinden mit der fünfstelligen Zahl', async () => {
        console.log("111")
        host_ws = new WebSocket("ws://localhost:"+port+"/lobby/"+lobbyCode);
        expect(host_ws).to.be(!undefined);
        console.log("111")
    })

    it('Verbinden mit der fünfstelligen Zahl', async () => {
        console.log("222222222")

        spieler_1 = new WebSocket("ws://localhost:"+port+"/lobby/"+lobbyCode);
        spieler_1.onopen = (msg) => expect(JSON.parse(msg).type=="wait"&&JSON.parse(msg).data.class === "J3a")
        console.log("222222222")
    })

    it('Verbinden mit der fünfstelligen Zahl', async () => {
        console.log("33333333")

        spieler_2 = new WebSocket("ws://localhost:"+port+"/lobby/"+lobbyCode);
        spieler_2.onopen = (msg) => expect(JSON.parse(msg).type=="wait"&&JSON.parse(msg).data.class === "J3a")
    })

    it('Verbinden mit der fünfstelligen Zahl', async () => {
        spieler_3 = new WebSocket("ws://localhost:"+port+"/lobby/"+lobbyCode);
        spieler_3.onopen = (msg) => expect(JSON.parse(msg).type=="wait"&&JSON.parse(msg).data.class === "J3a")
    })

    it('Verbinden mit der fünfstelligen Zahl', async () => {
        spieler_4 = new WebSocket("ws://localhost:"+port+"/lobby/"+lobbyCode);
        spieler_4.onopen = (msg) => expect(JSON.parse(msg).type=="wait"&&JSON.parse(msg).data.class === "J3a")
    })

    it('Verbinden mit der fünfstelligen Zahl', async () => {
        spieler_5 = new WebSocket("ws://localhost:"+port+"/lobby/"+lobbyCode);
        spieler_5.onopen = (msg) => expect(JSON.parse(msg).type=="wait"&&JSON.parse(msg).data.class === "J3a")
    })

    it('Verbinden mit der fünfstelligen Zahl', async () => {
        spieler_6 = new WebSocket("ws://localhost:"+port+"/lobby/"+lobbyCode);
        spieler_6.onopen = (msg) => expect(JSON.parse(msg).type=="wait"&&JSON.parse(msg).data.class === "J3a")
    })
    
    it('should close connection for invalid lobby code', (done) => {
        console.log("44444444444444444444")

        console.log(host_ws)
        host_ws.send('{type: "start_game"}')
        if(spieler_1.onmessage = (msg) => expect(JSON.parse(msg).type=="new_round")){
        spieler_1.onmessage = (msg) => expect(JSON.parse(msg).type=="new_round"&&JSON.parse(msg).data.game === "1"&&JSON.parse(msg).data.round === "1"&&JSON.parse(msg).data.name === "")
            if(spieler_1.onmessage = (msg) => expect(JSON.parse(msg).type=="place_offer")){
                console.log("4444444444444444")

                done()
            }
        }
    });


});
};


testing(startExpress())