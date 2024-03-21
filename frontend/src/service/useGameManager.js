//service to handle game logic / events

import { createContext, useContext, useEffect, useRef, useState } from "react";
import Landinpage from "../components/landingpage";
import Loginpage from "../components/loginpage";
import Play from "../components/playpage";

const GameManagerContext = createContext();
//this is a global instance that every component has access to
export default function useGameManager() {
  return useContext(GameManagerContext);
}

export function GameManagerProvider({ children }) {
  //changing events will trigger the useEffect() and do the respective things, like an eventListener
  const [event, setEvent] = useState({}); //what an event looks like: { type: "playerCount", data: "11", }

  //changing states will affect how the components are rendered
  const [state, setState] = useState({
    title: "Wilkommen!",
    body: <Landinpage />,
  }); //current state of the game { title: "Spiel 1 / Runde 2", type: "round"}

  const wsRef = useRef(null);
  let ws;
  useEffect(() => {
    console.log("new event!!");

    switch (event.type) {
      case "" || undefined:
        break;

      case "change_page":
        change_page(event.data);
        break;

      case "join":
        change_page('play_page');
        connect_websocket(event.data);
        break;

      default:
        setState(event.data);
        break;
    }
  }, [event]);

  function newEvent(newEvent) {
    // console.log(event); //event here is still the previous event
    setEvent(newEvent);
  }

  //controls which page will be rendered
  function change_page(page) {
    switch (page) {
      case "login_page":
        console.log("going to login page...");
        setState({ title: "Anmelden", body: <Loginpage /> });
        break;
      case "play_page":
        console.log("going to play page...");
        setState({ title: "Spiel 1 / Runde 2", body: <Play /> });
        break;
      default:
        break;
    }
  }

  function connect_websocket(code) {
    ws = new WebSocket('ws://localhost:8000/lobby/' + code);
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



  const publicVariables = {
    state,
    newEvent,
  };

  return (
    <GameManagerContext.Provider value={publicVariables}>
      {children}
    </GameManagerContext.Provider>
  );
}
