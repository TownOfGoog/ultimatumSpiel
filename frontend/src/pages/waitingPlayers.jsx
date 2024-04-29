import Grid from "../components/myGrid";
import ReactLoading from "react-loading";
import MyText from "../components/myText";
import useGameManager from "../service/useGameManager";

export default function WaitingPlayers() {
  const game = useGameManager();
  return (
    <Grid container columns={3} sx={{ height: "100%", flexWrap: "nowrap" }}>
      {/* left margin */}
      <Grid xs={1} sx={{ height: "100%" }} />

      {/* center */}
      <Grid container xs={1} columns={3} sx={{ height: "100%", justifyContent: 'center' }}>
        <Grid xs={3} sx={{ height: "40%", justifyContent: "center", alignItems: 'center' }}>

        {game.state.is_previous_offer_accepted && (
          <MyText title>Dein vorheriges Angebot wurde <MyText bold>{game.state.is_previous_offer_accepted ? 'Akzeptiert' : 'Abgelehnt'}</MyText>.</MyText>
        )}
        </Grid>
        {/* square in the middle */}
        <Grid
          xs={1}
          sx={{ width: '16vh', height: "16vh", display: "flex", justifyContent: "center" }}
        >
          <ReactLoading
            type={"spinningBubbles"}
            color={"black"}
            width={"100%"}
          />
        </Grid>
        <Grid
          xs={3}
          sx={{ height: "40%", display: "flex", justifyContent: "center" }}
        >
          <MyText>Warte auf anderen Spieler...</MyText>
        </Grid>
      </Grid>

      {/* right margin */}
      <Grid xs={1} sx={{ height: "100%" }} />
    </Grid>
  );
}
