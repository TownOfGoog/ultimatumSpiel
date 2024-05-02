//service to handle game logic / events

import { createContext, useContext, useEffect, useReducer, useRef } from "react";
import { useNavigate } from 'react-router-dom';
import Loginpage from "../pages/login";
import CreateGame from "../pages/createGame";
import WaitingPlayersHost from "../pages/waitingPlayersHost";
import WaitingPlayers from "../pages/waitingPlayers";
import PlaceOffer from "../pages/placeOffer";
import AnswerOffer from "../pages/answerOffer";
import PlayingHost from "../pages/playingHost";
import useDefaultValues from "./useDefaultValues";
import MyButton from "../components/myButton";
import Register from "../pages/register";
import Thanks4Playing from "../pages/thanks4Playing";

const GameManagerContext = createContext();

//this is a global instance that every component has access to
export default function useGameManager() {
  return useContext(GameManagerContext);
}

export function GameManagerProvider({ children }) {
  const dfault = useDefaultValues(); //default keyword doesnt work
  const navigate = useNavigate();
  //#region Reducer
  //here is the main logic of the game, a reducer to handle state changes
  function reducer(state, action) {
    switch (action.type) {
      case 'change_page':
        state.error = dfault.error //reset error message
        switch (action.payload) {
          case "home_page":
            console.log("going to home page...");
            let reset = { ...dfault, username: state.username, is_logged_in: state.is_logged_in, top_right: state.is_logged_in ? "" : dfault.top_right};
            return reset; //reset everything
          case "login_page":
            console.log("going to login page...");
            return { ...state, title: "Anmelden", body: <Loginpage />, top_right: <MyButton sx={{width: 'auto', paddingInline: '0.8em'}} onClick={() => navigate('/register')}>Registrieren</MyButton> };
          case "register_page":
            console.log("going to register page...");
            return { ...state, title: "Registrieren", body: <Register />, top_right: dfault.top_right };
          case "create_game":
            console.log("going to create game page...");
            return { ...state, title: "Spiel erstellen", body: <CreateGame /> };
          case "waiting_players_page_host":
            console.log("going to waiting players page...");
            return { ...state, title: "Warte auf Spieler", body: <WaitingPlayersHost /> };
          case "waiting_players_page":
            console.log("going to waiting players page...");
            return { ...state, body: <WaitingPlayers /> };
          case "playingHost":
            console.log("going to playingHost page...");
            return { ...state, body: <PlayingHost /> };
          case "thanks4playing_page":
            console.log("going to thanks4playing page...");
            return { ...state, title: "Danke fürs Spielen!", game_name: '', body: <Thanks4Playing/> };
          default:
            console.log("function change_page: unknown page: ", action.payload);
            return { ...state, title: "something went wrong, how did you get here?" };
        }
      case 'logged_in':
        console.log('logged in...');
        return { ...state, 
          is_logged_in: true,
          username: action.payload.username,
          top_right: '',
        }
      case 'logout':
        console.log('logged out...');
        return { ...state,
          is_logged_in: false,
          username: '',
          top_right: dfault.top_right,
        }
      case 'error':
        console.log('error: ', action.payload);
        return { ...state, error: action.payload }

      case 'connect_lobby':
        if (!Number.isInteger(action.payload.lobby_code)) return state
        console.log("connecting to lobby with code:", action.payload.lobby_code);
        console.log('action.payload: ', action.payload);
        if (state.is_host) return state; //do nothing if its the teacher trying to connect
        return { ...state,
          code: action.payload.lobby_code, //updating this will cause the useEffect to connect to the websocket
          top_right: '',
          game_name: '',
        }
      case 'connect_lobby_host':
        if (!Number.isInteger(action.payload.lobby_code)) return state
        console.log("connecting to lobby as host...", action.payload);
        return { ...state,
          code: action.payload.lobby_code, //updating this will cause the useEffect to connect to the websocket
          body: <WaitingPlayersHost />,
          is_host: true,
          top_right: action.payload.lobby_name,
          game_name: action.payload.game_name,
        }
      //#region Messages from Server
      case 'server_message':
        try {
          const message = JSON.parse(action.payload);
          console.log('message from server: ', message);
          switch (message.type) {
            case "new_player":
              console.log("new player joined");
              return { ...state, 
                total_player_count: state.total_player_count + 1 
              };
            case "wait":
              console.log('request accepted, waiting for other players...');
              return { ...state, 
                top_right: message.data ? message.data.class : state.class,
                body: <WaitingPlayers /> 
              };
            case 'new_round':
              console.log('starting new round...');
              const current_game = message.data.game;
              const current_round = message.data.round;

              return { ...state,
                current_game,
                current_round,
                title: `Spiel ${current_game} / Runde ${current_round}`,
                game_name: message.data.name,
                body: <PlayingHost />,
                is_previous_offer_accepted: undefined,
              };
            case 'place_offer':
              console.log('you should place an offer now...');
              return { ...state,
                body: <PlaceOffer />,
                error: message.data ? message.data.error || '' : ''
              }; 
            case 'answer_offer':
              console.log('somebody gives you', message.data.amount + '. would you accept it or not?');
              return { ...state,
                body: <AnswerOffer amount={message.data.amount} />,
              };
            case 'final':
              if (message.data.accepted === undefined) return state;
              console.log('previous offer was: ', message.data.accepted ? 'accepted' : 'declined');
              return { ...state,
                is_previous_offer_accepted: message.data.accepted,
              };
            case 'total_players':
              console.log('setting total player count to: ', message.data.amount);
              return { ...state,
                total_player_count: message.data.amount,
              };
            case 'new_offer':
              console.log('new offer: ', message.data.amount);
              return { ...state,
                //save data for chart in this round
                offer_per_money: state.offer_per_money.map(
                  item => item.amount === message.data.amount 
                  ? {...item, open: item.open + 1} 
                  : item
                ),
                player_count: state.player_count + 1,
              };
            case 'undo_offer': 
            console.log('state.phase: ', state.offer_phase);
              console.log('offer was undone: ', message.data.amount);
              return { ...state,
                player_count: 
                // state.offer_phase === 'answer_offer' ? state.player_count : 
                state.player_count - 1,
                
                //save data for chart in this round
                offer_per_money: state.offer_per_money.map(
                  item => item.amount === message.data.amount 
                  ? {...item, open: item.open - 1} 
                  : item
                ),
              };




            case 'offer_response':
              console.log('offer was answered: ', message.data.accepted ? 'accepted' : 'declined');
              const new_offer_per_money = state.offer_per_money.map(
                item => item.amount === message.data.amount
                ? {
                  ...item, 
                  [message.data.accepted ? 'accepted' : 'declined']: item[message.data.accepted ? 'accepted' : 'declined'] + 1, 
                  open: item['open'] - 1
                }
                : item
              )

              const new_offer_per_money_total = state.offer_per_money_total.map(
                //append data to the first element (total)
                (offer_per_money, index) => index === 0 ?
                offer_per_money.map( 
                  item => item.amount === message.data.amount ? {
                    ...item, 
                    //increment accepted or declined
                    [message.data.accepted ? 'accepted' : 'declined']: item[message.data.accepted ? 'accepted' : 'declined'] + 1, 
                  }
                  : item
                )

                //append data to the last element (current game)
                : index === state.offer_per_money_total.length - 1 ?
                offer_per_money.map( 
                  item => item.amount === message.data.amount ? {
                    ...item, 
                    //increment accepted or declined
                    [message.data.accepted ? 'accepted' : 'declined']: item[message.data.accepted ? 'accepted' : 'declined'] + 1, 
                  }
                  : item
                ) 
                : offer_per_money
              )

              const offer_total = new_offer_per_money_total[0][parseInt(message.data.amount) / 10]
              const offer_current_round = new_offer_per_money_total[new_offer_per_money_total.length-1][parseInt(message.data.amount) / 10]

              const new_offer_per_money_percent = state.offer_per_money_total_percent.map(
                //append data to the first element (total)
                (offer_per_money_percent, index) => index === 0 ?
                offer_per_money_percent.map(
                  item => item.amount === message.data.amount ? {
                    amount: item.amount,
                    //recalculate percentage of accepted offer
                    accepted: offer_total.accepted / (offer_total.declined + offer_total.accepted) * 100,
                    declined: offer_total.declined / (offer_total.declined + offer_total.accepted) * 100,
                  }
                  : item
                )

                //append data to the last element (current game)
                : index === state.offer_per_money_total_percent.length - 1 ?
                offer_per_money_percent.map(
                  item => item.amount === message.data.amount ? {
                    amount: item.amount,
                    //recalculate percentage of accepted offer
                    accepted: offer_current_round.accepted / (offer_current_round.declined + offer_current_round.accepted) * 100,
                    declined: offer_current_round.declined / (offer_current_round.declined + offer_current_round.accepted) * 100,
                  }
                  : item
                )
                : offer_per_money_percent
              )
              
              return { ...state, 
                //increment specifc offer and decrement specific open offer
                offer_per_money: new_offer_per_money,
                //safe data for chart in total
                offer_per_money_total: new_offer_per_money_total,
                //safe data for chart in total in percent
                offer_per_money_total_percent: new_offer_per_money_percent,

                player_count: state.player_count + 1,
              };
            case 'exit':
              console.log('the lobby is closed, thank you for playing!')
              return { ...state,
                exit_player: true,
              }
            default:
              console.warn("error: unknown message from server: ", message);
              return state;
          }
        } catch (error) {
          console.warn("response from server (but not json): ", action.payload, error);
          return state;
        }

      //#region Messages to Server
      //manage website when sending data to the server
      case 'sent_message':
        console.log('sent message to server: ', action.payload);
        switch (action.payload.type) {
          case 'start_game':
            const reset_offer_per_money = [...state.offer_per_money].map(
              ({open, ...item}) => ({ //remove open offers
                ...item, accepted: 0, declined: 0 //reset accepted and declined offers
              })
            )
            return { ...state,
              //reset data for chart for current round
              offer_phase: 'make_offer',
              offer_per_money: dfault.offer_per_money,

              //make space for chart data for our new game
              offer_per_money_total: [
                ...state.offer_per_money_total, [...reset_offer_per_money]
              ],
              offer_per_money_total_percent: [
                ...state.offer_per_money_total_percent, [...reset_offer_per_money]
              ],
              title: action.payload.data.name,
              game_names: [...state.game_names, action.payload.data.name],
              body: <WaitingPlayersHost />,
            }
          case 'offer':
            console.log('offering ', action.payload.data.amount);
            return { ...state,
              last_offer: action.payload.data.amount,
            }
          case 'answer_offer':
            console.log('offer was answered: ', action.payload.data.accepted ? 'accepted' : 'declined');
            return state;
          case 'start_round':
            console.log('starting a new round...');
            return { ...state,
              //fix player count
              player_count: state.total_player_count,
            };
          case 'skip':
            console.log('skipping round...');
            return { ...state, 
              player_count: state.total_player_count,
            }
          case 'exit':
            console.log('kicking every player out...');

            return { ...state,
              exit: true,
            }
          default:
            return state;
        }
      
      case 'phase_change':
        if (state.total_player_count === Infinity) return state
        if (state.total_player_count === 0) return { ...state, offer_phase: 'wait'}
        if (state.player_count === state.total_player_count) {
          console.log('everyone has answered, current offer_phase: ', state.offer_phase);
          
          if (state.offer_phase === 'make_offer') {
            console.log('we were in the makingoffer phase.');
            return { ...state,
              offer_phase: 'answer_offer',
              player_count: 0,
            };
          } else if (state.offer_phase === 'answer_offer') {
            console.log('we were in the answering offer phase.');
            return { ...state,
              offer_phase: 'wait',
              player_count: 0,
            };
          } else {
            console.log('we were in the waiting phase.');
            
            return {...state,
              offer_phase: 'make_offer',
              player_count: 0,
              offer_per_money: dfault.offer_per_money,
            };
          }
        } else {
          return state;
        }
      case 'server_close':
        console.log('server closed connection');
        action.payload.current = null
        return { ...state,
          code: null,
          exit_player: false,
        }
      default:
        console.warn("sent something unknown to server: ", action);
        return state
    }
  }

  const [state, dispatch] = useReducer(reducer, useDefaultValues())

  //#region Websocket
  const ws = useRef(null); //websocket connection

  useEffect(() => {
    if (!state.code) return 

    ws.current = new WebSocket(`ws${process.env.REACT_APP_HTTPS ? 's' : ''}://${process.env.NODE_ENV === 'development' ? 'localhost:8080' : window.location.host}/lobby/${state.code}`);

    ws.current.onopen = () => console.log("websocket connected")

    ws.current.onmessage = (e) => dispatch({type: 'server_message', payload: e.data})

    ws.current.onclose = () => {dispatch({type: 'server_close', payload: ws}); navigate('/')}
  }, [state.code])

  useEffect(() => {
    console.log('player count changed.');
    dispatch({type: 'phase_change'})
  }, [state.player_count, state.total_player_count])

  useEffect(() => {
    if (state.exit_player) {
      console.log('exiting game...');
      dispatch({type: 'server_close', payload: ws})
      navigate('/thanks4playing')
    }
  }, [navigate, state.exit_player])
  
  //#region Functions
  function new_game(game_name) {
    console.log('starting new game...')
    let name = game_name || ''
    const message = {
      type: "start_game",
      data: {
        name: name,
      }
    }
    ws.current.send(JSON.stringify(message))
    dispatch({type: 'sent_message', payload: message})
  }
  
  function new_round() {
    console.log("new round...");
    // setPlayerCount(totalPlayerCount); //this will trigger the useEffect to change the phase
    const message = {
      type: "start_round",
      data: {},
    };
    ws.current.send(JSON.stringify(message));
    dispatch({type: 'sent_message', payload: message})
  }

  function place_offer(amount) {
    console.log(`giving ${amount} money...`);
    const message = {
      type: "offer",
      data: {
        amount: amount,
      },
    };
    ws.current.send(JSON.stringify(message));
    dispatch({type: 'sent_message', payload: message})
  }

  function answer_offer(accepted) {
    console.log('offer', accepted ? 'accepted.' : 'declined.');
    const message = {
      type: accepted ? 'accept_offer' : 'decline_offer',
      data: {},
    };
    ws.current.send(JSON.stringify(message));
    dispatch({type: 'sent_message', payload: message})
  }
    
  function skip() {
    console.log("skipping round...");
    const message = {
      type: "skip",
      data: {},
    };
    ws.current.send(JSON.stringify(message));
    dispatch({type: 'sent_message', payload: message})
  }

  function exit() {
    console.log("closing game...");
    const message = {
      type: "exit",
      data: {},
    };
    ws.current.send(JSON.stringify(message));
    dispatch({type: 'sent_message', payload: message})
  }

  function return_to_menu() {
    console.log("returning to menu...");
    if (ws.current) ws.current.close()
  }

  function is_mobile() {
    return window.innerWidth < 600
  } 

  //#region Return
  //all the variables and functions made global
  let publicVariables = {
    state,
    dispatch,
    navigate,
    new_game,
    new_round,
    place_offer,
    answer_offer,
    skip,
    exit,
    return_to_menu,
    is_mobile
  };

  return (
    <GameManagerContext.Provider value={publicVariables}>
      {children}
    </GameManagerContext.Provider>
  );
}
