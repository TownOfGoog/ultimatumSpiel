import FormControl from "@mui/joy/FormControl";
import MyInput from "../components/myInput";
import MyButton from "../components/myButton";
import Grid from "../components/myGrid";
// import Grid from "@mui/joy/Grid";
import { useState } from "react";
import useGameManager from "../service/useGameManager";

export default function CreateGame() {
  const [lobbyName, setLobbyName] = useState("");

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
            value={lobbyName}
            setValue={setLobbyName}
          />
          <div style={{margin: '0.3em 0 0.3em 0'}}></div>
          <MyButton
            onClick={() => {
              game.create_lobby(lobbyName);
            }}
          >
            Lobby erstellen
          </MyButton>
        </FormControl>
      </Grid>

      <Grid xs={1} />
    </Grid>
  );
}
