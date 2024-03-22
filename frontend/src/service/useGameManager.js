//service to handle game logic / events

import { createContext, useContext, useState } from "react";
import Landinpage from "../pages/home";
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
      case "waiting_players_page_host":
        console.log("going to waiting players page...");
        setState({ title: "Warte auf Spieler", body: <WaitingPlayersHost code={additional_info}/> });
        break;
        case "waiting_players_page":
          console.log("going to waiting players page...");
          setState({ title: "Warte auf Spieler", body: <WaitingPlayers/> });
          break;
      default:
        setState({ title: "Wilkommen!", body: <Landinpage /> });
        break;
    }
  }

  function connect_websocket(code) {
    console.log(`connecting to websocket with code: ${code}...`);
    ws = new WebSocket(`ws://${process.env.REACT_APP_BACKEND_URL}/lobby/${code}`);
    ws.onopen = () => {
      console.log("connected");
      ws.send("hello");
    };
    ws.onmessage = (e) => {
      const message = JSON.parse(e.data)
      switch(message.type) {
        case "player_count":
          console.log("player count: ", message.data);
          setState((prev) => ({...prev, data: message.data}));
          break;
        default:
          console.log('response from server:',  message);
          break;
      }
    };
    ws.onclose = () => {
      console.log("disconnected");
    };
  }

  public_function("state", state);

  public_function("change_page", change_page);

  public_function("join_lobby", (code) => {
    change_page("waiting_players_page");
    connect_websocket(code);
  });

  public_function("create_lobby", (name) => {

    fetch(`http://${process.env.REACT_APP_BACKEND_URL}/lobby/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name: name }),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log('got code: ', data);
        const code = data
        change_page("waiting_players_page_host", code); 
        connect_websocket(code);
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  });

  return (
    <GameManagerContext.Provider value={publicFunctions}>
      {children}
    </GameManagerContext.Provider>
  );
}
