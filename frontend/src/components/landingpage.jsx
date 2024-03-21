import Grid from "@mui/joy/Grid";
import FormLabel from "@mui/joy/FormLabel";
import FormControl from "@mui/joy/FormControl";
import FormHelperText from "@mui/joy/FormHelperText";
import { useState } from "react";
import MyInput from "./myInput";
import MyButton from "./myButton";
import useGameManager from "../service/useGameManager";

export default function Landinpage() {
  const [codeValue, setCodeValue] = useState(""); //this value will be formatted to mostly avoid faulty inputs
  const game = useGameManager();
  return (
    <>
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
            <FormLabel
              sx={{ color: "black", fontWeight: "bold", fontSize: "1.7em" }}
            >
              Code eingeben
            </FormLabel>
            <MyInput value={codeValue} setValue={setCodeValue} big={true} />
            {/* error handling for another day */}
            {/* <FormHelperText> 
                Dieser Code muss 5-stellig sein.
              </FormHelperText> */}
          </FormControl>

          <div
            style={{
              position: "relative",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              textAlign: "center",
              marginTop: "1.3em",
            }}
          >
            <MyButton
              text="Lobby betreten"
              onClick={() => {
                game.newEvent({ type: "join", data: codeValue }); 
              }}
            />
          </div>
        </Grid>

        <Grid
          xs={1}
          sx={{
            position: "relative",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
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

          <div
            style={{
              position: "relative",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              textAlign: "center",
              marginTop: "1.3em",
            }}
          >
            <MyButton
              text="Anmelden"
              onClick={() => {
                game.newEvent({ type: "change_page", data: "login_page" });
              }}
            />
          </div>
        </Grid>
      </Grid>
    </>
  );
}
