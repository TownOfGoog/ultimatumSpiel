import FormControl from "@mui/joy/FormControl";
import MyInput from "../components/myInput";
import MyButton from "../components/myButton";
import Grid from "../components/myGrid";
// import Grid from "@mui/joy/Grid";
import { useState } from "react";
import useGameManager from "../service/useGameManager";

export default function CreateGame() {
  const [lobby_name, setLobbyName] = useState("");
  const [game_name, setGameName] = useState("");
  const game = useGameManager();

  return (
    <Grid
      container
      columns={4}
      sx={{ flexGrow: 1, height: "100%" }}
    >
      <Grid xs={1} />

      <Grid
        xs={2}
        sx={{
          position: "relative",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
        }}
      >
        <FormControl
          sx={{
            flexWrap: "wrap",
            alignContent: "center",
          }}
        >
          <MyInput
            label={"Lobby Name"}
            value={lobby_name}
            setValue={setLobbyName}
          />
        </FormControl>
        
        <MyInput
            label="Erstes Spiel Name"
            value={game_name}
            setValue={setGameName}
          />
          <div style={{margin: '0.3em 0 0.3em 0'}}></div>
          
        {game.state.error && (
          <>
            <div style={{color: 'red', display: 'flex', justifyContent: 'center'}}>{game.state.error}</div>
            <div style={{margin: '0.3em 0 0.3em 0'}}></div>
          </>
        )}
        
          <MyButton
            onClick={() => {
              console.log('creating lobby...');
              console.log('process.env.REACT_APP_BACKEND_URL: ', process.env.REACT_APP_BACKEND_URL);
              //when creating a lobby, save the code and join it's lobby
              console.log('fetchstring:', `https://${process.env.REACT_APP_BACKEND_URL}/lobby/create`);
              fetch(`https://${process.env.REACT_APP_BACKEND_URL}/lobby/create`, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                credentials: 'include',
                body: JSON.stringify({ name: lobby_name }),
              })
              .then((response) => {
                if (response.status !== 200) {
                  response.json().then((msg) => game.dispatch({type: 'error', payload: msg}))
                  return
                }
                return response.json()
              })
              .then((data) => {
                if (!data) return
                console.log("lobbycode will be: ", data);
                const lobby_code = data;
                game.dispatch({ type: "connect_lobby_host", payload: { lobby_code, lobby_name, game_name }})
                game.navigate(`/lobby/${lobby_code}`);
              })
              .catch((error) => {
                console.log(error, "trying again with http");
                fetch(`http://${process.env.REACT_APP_BACKEND_URL}/lobby/create`, {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  credentials: 'include',
                  body: JSON.stringify({ name: lobby_name }),
                })
                .then((response) => {
                  if (response.status !== 200) {
                    response.json().then((msg) => game.dispatch({type: 'error', payload: msg}))
                    return
                  }
                  return response.json()
                })
                .then((data) => {
                  if (!data) return
                  console.log("lobbycode will be: ", data);
                  const lobby_code = data;
                  game.dispatch({ type: "connect_lobby_host", payload: { lobby_code, lobby_name, game_name }})
                  game.navigate(`/lobby/${lobby_code}`);
                }).catch(err => console.error(err));
              });
            }}
          >
            Lobby erstellen
          </MyButton>
      </Grid>

      <Grid xs={1} />
    </Grid>
  );
}
