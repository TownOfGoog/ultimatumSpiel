import Grid from "../components/myGrid";
import FormControl from "@mui/joy/FormControl";
import FormHelperText from "@mui/joy/FormHelperText";
import { useState } from "react";
import MyInput from "../components/myInput";
import MyButton from "../components/myButton";
import useGameManager from "../service/useGameManager";
import MyChart from "../components/myChart";

export default function Home() {
  const [codeValue, setCodeValue] = useState(""); //this value will be formatted to mostly avoid faulty inputs
  const game = useGameManager();
  return (
    <Grid
      container
      columns={2}
      sx={{ flexGrow: 1, bgcolor: "white", height: "100%" }}
    >
      <Grid
        xs={1}
        sx={{
          position: "relative",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          borderRight: "1px solid black",
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
            value={codeValue}
            setValue={setCodeValue}
            big={true}
            title={"Code eingeben"}
          />
          {/* error handling for another day */}
          {/* <FormHelperText> 
                Dieser Code muss 5-stellig sein.
              </FormHelperText> */}
        </FormControl>
        
        <div style={{margin: '0.3em 0 0.3em 0'}}></div>

          <MyButton
            onClick={() => {
              game.join_lobby(codeValue);
            }}
          >
            Lobby betreten
          </MyButton>
      </Grid>

      <Grid
        xs={1}
        sx={{
          position: "relative",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          borderLeft: "1px solid black",
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

        <MyButton
          onClick={() => {
            game.change_page("create_game");
          }}
        >
          Lobby erstellen
        </MyButton>
      </Grid>
    </Grid>
  );
}
