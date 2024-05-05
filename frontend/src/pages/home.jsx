import Grid from "../components/myGrid";
import FormControl from "@mui/joy/FormControl";
import { useState } from "react";
import MyInput from "../components/myInput";
import MyButton from "../components/myButton";
import useGameManager from "../service/useGameManager";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const [lobby_code, setLobby_code] = useState(""); //this value will be formatted to mostly avoid faulty inputs
  const game = useGameManager();
  const navigate = useNavigate();
  return (
    <Grid
      container
      columns={2}
      sx={{ flexGrow: 1, height: "100%" }}
    >
      <Grid
        xs={2}
        sm={1}
        sx={{
          position: "relative",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          border: "1px solid black",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: "9vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: 2,
            fontSize: "2.5em",
            width: "100%",
          }}
        >
          Spiel spielen
        </div>

        <FormControl
          sx={{
            flexWrap: "wrap",
            alignContent: "center",
          }}
        >
          <MyInput
            value={lobby_code}
            setValue={setLobby_code}
            big={true}
            title={"Code eingeben"}
          />
        </FormControl>
        
        {game.state.code_error && (
            <div style={{color: 'red', textAlign: 'center'}}>{game.state.code_error}</div>
        )}

        <div style={{margin: '0.3em 0 0.3em 0'}}></div>
          <MyButton
            onClick={() => {
              navigate(`/lobby/${lobby_code || 1}`)
            }}
          >
            Lobby betreten
          </MyButton>
      </Grid>

      <Grid
        xs={2}
        sm={1}
        sx={{
          position: "relative",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          border: "1px solid black",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: "9vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: 2,
            fontSize: "2.5em",
            width: "100%",
          }}
        >
          Spiel erstellen
        </div>

        {
          game.state.is_logged_in ?
          <MyButton
            onClick={() => {
              navigate('/create')
            }}
          >
            Lobby erstellen
          </MyButton>
          :
          <MyButton
            onClick={() => {
              navigate('/login')
            }}
          >
            Anmelden
          </MyButton>

        }
      </Grid>
    </Grid>
  );
}
