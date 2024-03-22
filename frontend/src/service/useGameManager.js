//service to handle game logic / events

import { createContext, useContext, useRef, useState } from "react";
import Landinpage from "../pages/home";
import Loginpage from "../pages/login";
import Play from "../pages/play";
import CreateGame from "../pages/createGame";
import WaitingPlayers from "../pages/waitingPlayers";

const GameManagerContext = createContext();

//this is a global instance that every component has access to
export default function useGameManager() {
  return useContext(GameManagerContext);
}

export function GameManagerProvider({ children }) {
  //changing states will affect how the components (eg. navbar) are rendered
  const [state, setState] = useState({
    title: "Wilkommen!",
    body: <Landinpage />,
  });

  let publicFunctions = {}; //functions that will be made global

  //use this function to declare it public/global
  function public_function(name, func) {
    publicFunctions[name] = func;
  }

  // const wsRef = useRef(null);

  let ws;

  //controls which page will be rendered
  function change_page(page, additional_info = null) {
    switch (page) {
      case "login_page":
        console.log("going to login page...");
        setState({ title: "Anmelden", body: <Loginpage /> });
        break;
      case "play_page":
        console.log("going to play page...");
        setState({ title: "Spiel 1 / Runde 2", body: <Play /> });
        break;
      case "create_game":
        console.log("going to create game page...");
        setState({ title: "Lobby erstellen", body: <CreateGame /> });
        break;
      case "waiting_players_page":
        console.log("going to waiting players page...");
        setState({ title: "Warte auf Spieler", body: <WaitingPlayers code={additional_info}/> });
        break;
      default:
        setState({ title: "Wilkommen!", body: <Landinpage /> });
        break;
    }
  }

  function connect_websocket(code) {
    ws = new WebSocket("ws://localhost:8000/lobby/" + code);
    ws.onopen = () => {
      console.log("connected");
      ws.send("hello");
    };
    ws.onmessage = (e) => {
      console.log(e.data);
    };
    ws.onclose = () => {
      console.log("disconnected");
    };
    console.log("url: ", code);
  }

  public_function("state", state);

  public_function("change_page", change_page);

  public_function("join_lobby", (code) => {
    change_page("play_page");
    connect_websocket(code);
  });

  public_function("create_lobby", (name) => {
    fetch("http://localhost:8080/lobby/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name: name }),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Success:", data);
      })
      // hardcode lobby code
      .catch((error) => {
        const code = 15583
        change_page("waiting_players_page", code)
      });
      // .catch((error) => {
      //   console.error("Error:", error);
      // });
  });

  return (
    <GameManagerContext.Provider value={publicFunctions}>
      {children}
    </GameManagerContext.Provider>
  );
}
