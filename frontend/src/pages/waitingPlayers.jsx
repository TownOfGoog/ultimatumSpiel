import Grid from "../components/myGrid";
// import { Grid } from "@mui/joy";

import ReactLoading from "react-loading";
import MyText from "../components/myText";
import useGameManager from "../service/useGameManager";

export default function WaitingPlayers() {
  const game = useGameManager();
  return (
    <Grid container columns={3} sx={{ height: "100%", flexWrap: "nowrap" }}>
      <Grid xs={1} sx={{ height: "100%" }} />
      <Grid container xs={1} columns={3} sx={{ height: "100%" }}>
        <Grid xs={3} sx={{ height: "40%" }}></Grid>
        <Grid
          xs={3}
          sx={{ height: "20%", display: "flex", justifyContent: "center" }}
        >
          <ReactLoading
            type={"spinningBubbles"}
            color={"black"}
            width={"31%"}
          />
        </Grid>
        <Grid xs={3} sx={{ height: "40%", display: "flex", justifyContent: "center" }}>
          <MyText>
            {game.state.player_count} Spieler sind hier
          </MyText>
        </Grid>
      </Grid>
      <Grid xs={1} sx={{ height: "100%" }} />
    </Grid>
  );
}
