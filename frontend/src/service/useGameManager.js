//service to handle game logic / events

import { createContext, useContext, useEffect, useState } from "react";
import Home from "../pages/home";
import Loginpage from "../pages/login";
import Play from "../pages/play";
import CreateGame from "../pages/createGame";
import WaitingPlayersHost from "../pages/waitingPlayersHost";
import WaitingPlayers from "../pages/waitingPlayers";

const GameManagerContext = createContext();

//this is a global instance that every component has access to
export default function useGameManager() {
  return useContext(GameManagerContext);
}

//here is the main logic of the game
export function GameManagerProvider({ children }) {
  const [ws, setWs] = useState(null); //websocket connection
  const [title, setTitle] = useState("something went wrong"); //title to be displayed in the navbar
  const [topRight, setTopRight] = useState("login"); //top right corner of the page (login or current class)
  const [body, setBody] = useState(<p>something went wrong</p>); //content of the page
  const [code, setCode] = useState(null); //lobbycode
  const [playerCount, setPlayerCount] = useState(0); //number of players in the lobby

  //central function to control what is on the page
  function change_page(page) {
    switch (page) {
      case "home_page":
        console.log("going to home page...");
        setTitle("Wilkommen!");
        setBody(<Home />);
        break;
      case "login_page":
        console.log("going to login page...");
        setTitle("Anmelden");
        setBody(<Loginpage />);
        break;
      case "play_page":
        console.log("going to play page...");
        // setTitle("") //should be set from websocket logic
        setBody(<Play />);
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
        setTitle("Warte auf Spieler");
        setBody(<WaitingPlayers />);
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
      ws.send("hello");
    };

    ws.onmessage = (e) => {
      // a message from the server could look like this:
      // message = {
      //   type: "play_round",
      //   data: {
      //     game: 1,
      //     round: 1,
      //     class: "I3a"
      //     action: "place_offer" //or "answer_offer" // should it be offer or ask?
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
          case "play_round":
            console.log("game is starting...");
            setTopRight(message.data.class);
            setTitle(
              `Spiel ${message.data.game} / Runde ${message.data.round}`
            );
            change_page("play_page");
            break;
          default:
            break;
        }
      } catch (error) {
        console.warn("response from server (but not json): ", e.data);
      }
    };
    ws.onclose = () => {
      console.log("disconnected");
    };

    setWs(ws);
  }

  function place_offer(amount) {
    console.log(`vergebe ${amount} geld...`);
    const message = JSON.stringify({
      type: "offer",
      data: {
        amount: amount
      },
    })
    ws.send(message);
  }

  function accept_offer() {
    console.log('akzeptiere angebot...');
    const message = JSON.stringify({
      type: "accept_offer",
      data: {},
    })
    ws.send(message);
  }

  function decline_offer() {
    console.log('lehne angebot ab...');
    const message = JSON.stringify({
      type: "decline_offer",
      data: {},
    })
    ws.send(message);
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
        join_lobby(code);
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  }

  function join_lobby(code) {
    console.log("joining lobby with code:", code);
    //if host:
    change_page("waiting_players_page_host");
    //else:
    // change_page("waiting_players_page");
    connect_websocket(code);
  }

  //all the variables and functions made global
  let publicVariables = {
    title,
    topRight,
    body,
    code,
    playerCount,
    create_lobby,
    join_lobby,
    place_offer,
    accept_offer,
    decline_offer,
    change_page,
  };
  
  return (
    <GameManagerContext.Provider value={publicVariables}>
      {children}
    </GameManagerContext.Provider>
  );
}
