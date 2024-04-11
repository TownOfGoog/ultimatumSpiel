//service to handle game logic / events

import { createContext, useContext, useEffect, useState } from "react";
import Home from "../pages/home";
import Loginpage from "../pages/login";
import CreateGame from "../pages/createGame";
import WaitingPlayersHost from "../pages/waitingPlayersHost";
import WaitingPlayers from "../pages/waitingPlayers";
import PlaceOffer from "../pages/placeOffer";
import AnswerOffer from "../pages/answerOffer";
import PlayingHost from "../pages/playingHost";
import useDefaultValues from "./useDefaultValues";

const GameManagerContext = createContext();

//this is a global instance that every component has access to
export default function useGameManager() {
  return useContext(GameManagerContext);
}

//here is the main logic of the game
export function GameManagerProvider({ children }) {
  const dfault = useDefaultValues(); //default keyword doesnt work

  const [ws, setWs] = useState(dfault.ws); //websocket connection
  const [title, setTitle] = useState(dfault.title); //title to be displayed in the navbar
  const [topRight, setTopRight] = useState(dfault.topRight) //top right corner of the page (login or current class)
  const [body, setBody] = useState(dfault.body); //content of the page
  const [code, setCode] = useState(dfault.code); //lobbycode
  const [playerCount, setPlayerCount] = useState(dfault.playerCount); //number of players in the lobby
  const [totalPlayerCount, setTotalPlayerCount] = useState(dfault.totalPlayerCount); //number of players in the lobby, will be set once the game starts
  const [offerPhase, setOfferPhase] = useState(dfault.offerPhase); //if true, the player is giving an offer, if false, the player is answering an offer
    
  //data for chart
  const [offerPerMoney, setOfferPerMoney] = useState(dfault.offerPerMoney)
  //data for chart aggregated over the whole game (lobby)
  const [offerPerMoneyTotal, setOfferPerMoneyTotal] = useState(dfault.offerPerMoneyTotal)
  //data for aggregated chart in percent
  const [offerPerMoneyTotalPercent, setOfferPerMoneyTotalPercent] = useState(dfault.offerPerMoneyTotalPercent)
  
  useEffect(() => {
    console.log("nächste phase...", playerCount, totalPlayerCount);
    if (playerCount === totalPlayerCount) {
      console.log('offerPhase: ', offerPhase);
      
      if (offerPhase === 'make_offer') {
        console.log('nun sind wir in der antwortphase...');
        setOfferPhase('answer_offer');
        setPlayerCount(0);
      } else if (offerPhase === 'answer_offer') {
        console.log('nun sind wir in der warte-phase...');
        setOfferPhase('wait');
        setPlayerCount(0);
      } else {
        console.log('nun sind wir in der angebotsphase...');
        setOfferPhase('make_offer');
        setPlayerCount(0);
        console.log('UPDATING TOTALS');
        console.log('offerPerMoney: ', offerPerMoney);
        //reset data for chart, but not data for total chart
        setOfferPerMoney(dfault.offerPerMoney)
      }
    }
    //eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playerCount, totalPlayerCount]);
  //we dont need to rerun this effect when title changes, because this effect changes the title

  //central function to control what is on the page
  function change_page(page) {
    switch (page) {
      case "home_page":
        console.log("going to home page...");
        setTitle("Willkommen!");
        setBody(<Home />);
        break;
      case "login_page":
        console.log("going to login page...");
        setTitle("Anmelden");
        setBody(<Loginpage />);
        break;
      case "create_game":
        console.log("going to create game page...");
        setTitle("Spiel erstellen");
        setBody(<CreateGame />);
        break;
      case "waiting_players_page_host":
        console.log("going to waiting players page...");
        setTitle("Warte auf Spieler");
        setBody(<WaitingPlayersHost />);
        break;
      case "waiting_players_page":
        console.log("going to waiting players page...");
        setBody(<WaitingPlayers />);
        break;
      case "playingHost":
        console.log("going to playingHost page...");
        setBody(<PlayingHost />);
        break;
      default:
        console.log("function change_page: unknown page: ", page);
        setTitle("something went wrong, how did you get here?");
        break;
    }
  }

  function connect_websocket(code) {
    console.log(`connecting to websocket with code: ${code}...`);

    const ws = new WebSocket(
      `ws://${process.env.REACT_APP_BACKEND_URL}/lobby/${code}`
    );

    ws.onopen = () => {
      console.log("connected");
      ws.send(JSON.stringify({ msg: "hello" }));
    };

    ws.onmessage = (e) => {
      // a message from the server could look like this:
      // message = {
      //   type: "play_round",
      //   data: {
      //     game: 1,
      //     round: 1,
      //     class: "I3a"
      //     amount: 100,
      //     action: "place_offer" //or "answer_offer"
      //   }
      // }
      try {
        const message = JSON.parse(e.data);
        console.log("response from server:", message);
        switch (message.type) {
          case "player_count":
            console.log("player count: ", message.data);
            setPlayerCount(message.data);
            break;
          case "new_player":
            console.log("neuer spieler");
            setPlayerCount((prev) => prev + 1);
            break;
          case "new_offer":
            console.log("neues angebot: ", message.data.amount);
            setPlayerCount((prev) => prev + 1);
            //change data for chart 1 (offers per money)
            setOfferPerMoney((prev) => {
              const newData = [...prev];
              newData[parseInt(message.data.amount) / 10].open++;
              return newData;
            })
            break;
          case "offer_response":
            console.log("angebot wurde beantwortet: ", message.data);
            setPlayerCount((prev) => prev + 1);
            //change data for chart (offers per money)
            setOfferPerMoney((prev) => {
              const newData = [...prev];
              const answer = message.data.accepted ? "accepted" : "declined";
              //set accepted or declined
              newData[parseInt(message.data.amount) / 10][answer]++;
              //decrease open offers for that money
              newData[parseInt(message.data.amount) / 10].open--;

              return newData;
            })
            //also update data for total chart
            setOfferPerMoneyTotal((prev) => {
              const newData = [...prev];
              const answer = message.data.accepted ? "accepted" : "declined";
              //set accepted or declined
              newData[parseInt(message.data.amount) / 10][answer]++;
              
              return newData;
            });
            //also update data for total chart in percent
            setOfferPerMoneyTotalPercent((prev) => {
              
              //get total amount of accepted and declined offers
              //if new offer is accepted, increase accepted
              const totalAccepted = offerPerMoneyTotal[parseInt(message.data.amount) / 10].accepted
              //if declined, increase declined
              const totalDeclined = offerPerMoneyTotal[parseInt(message.data.amount) / 10].declined
              
              //calculate percentage
              const acceptedPercent = totalAccepted / (totalAccepted + totalDeclined) * 100;
              const declinedPercent = totalDeclined / (totalAccepted + totalDeclined) * 100;

              //set percentage
              const newData = [...prev];
              newData[parseInt(message.data.amount) / 10].accepted = acceptedPercent;
              newData[parseInt(message.data.amount) / 10].declined = declinedPercent;
              newData[parseInt(message.data.amount) / 10].amount = prev[parseInt(message.data.amount) / 10].amount
              return newData;
            });
            break;
          case "new_round":
            console.log("neue runde: ", message.data);
            change_page("playingHost");
            setOfferPhase('make_offer');
            setTitle(
              `Spiel ${message.data.game} / Runde ${message.data.round}`
            );
            break;
          case "place_offer":
            console.log("Wähle dein Angebot");
            setBody(<PlaceOffer />);
            break;
          case "answer_offer":
            console.log("Antworte auf das Angebot");
            setBody(<AnswerOffer amount={message.data.amount} />);
            break;
          case "wait":
            console.log("request accepted, waiting for other players...");
            change_page("waiting_players_page");
            if (message.data && message.data.class)
              setTopRight(message.data.class);
            break;
          default:
            break;
        }
      } catch (error) {
        console.warn("response from server (but not json): ", e.data, error);
      }
    };
    ws.onclose = () => {
      setPlayerCount(0);
      setTotalPlayerCount(Infinity);
      change_page("home_page");
      window.location.reload();
      console.log("disconnected");
    };

    setWs(ws);
  }

  function create_lobby(name) {
    //when creating a lobby, save the code and join it's lobby
    fetch(`http://${process.env.REACT_APP_BACKEND_URL}/lobby/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name: name }),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("got code: ", data);
        const code = data;
        setCode(code);
        setTopRight(name);
        join_lobby(code);
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  }

  function join_lobby(code) {
    console.log("joining lobby with code:", code);
    setTitle("Warte auf Spieler");
    change_page("waiting_players_page_host");
    connect_websocket(code);
  }

  function start_game() {
    console.log("starte spiel...");
    const message = JSON.stringify({
      type: "start_game",
      data: {},
    });
    ws.send(message);
    setTotalPlayerCount(playerCount);
    setPlayerCount(0);
    change_page("playingHost");
  }
  
  function new_game() {
    console.log("neues Spiel...");
    setPlayerCount(totalPlayerCount); //this will trigger the useEffect to change the phase
    const message = JSON.stringify({
      type: "start_game",
      data: {},
    });
    ws.send(message);
  }

  function new_round() {
    console.log("neue Runde...");
    setPlayerCount(totalPlayerCount); //this will trigger the useEffect to change the phase
    const message = JSON.stringify({
      type: "start_round",
      data: {},
    });
    ws.send(message);
  }

  function place_offer(amount) {
    console.log(`vergebe ${amount} geld...`);
    const message = JSON.stringify({
      type: "offer",
      data: {
        amount: amount,
      },
    });
    ws.send(message);
  }

  function accept_offer() {
    console.log("akzeptiere angebot...");
    const message = JSON.stringify({
      type: "accept_offer",
      data: {},
    });
    ws.send(message);
  }

  function decline_offer() {
    console.log("lehne angebot ab...");
    const message = JSON.stringify({
      type: "decline_offer",
      data: {},
    });
    ws.send(message);
  }

  function skip() {
    console.log("überspringe runde...");
    setPlayerCount(totalPlayerCount); //this will trigger the useEffect to change the phase
    const message = JSON.stringify({
      type: "skip",
      data: {},
    });
    ws.send(message);
  }

  //all the variables and functions made global
  let publicVariables = {
    title,
    topRight,
    body,
    code,
    playerCount,
    totalPlayerCount,
    offerPhase,
    offerPerMoney,
    offerPerMoneyTotal,
    offerPerMoneyTotalPercent,
    change_page,
    create_lobby,
    join_lobby,
    start_game,
    new_game,
    new_round,
    place_offer,
    accept_offer,
    decline_offer,
    skip,
  };

  return (
    <GameManagerContext.Provider value={publicVariables}>
      {children}
    </GameManagerContext.Provider>
  );
}
