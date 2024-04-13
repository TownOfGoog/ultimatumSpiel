import Grid from "@mui/joy/Grid";
import logo from "../assets/logo.png"
import useGameManager from "../service/useGameManager";
import MyText from "./myText";

export default function Nav() {
  const game = useGameManager();
  return (
    <Grid container columns={{ xs: 3 }} sx={{ flexGrow: 1, bgcolor: "black", color: "white", height: "100%", flexWrap: "nowrap" }}>
      <Grid
        xs={1} sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-start",
        }}
      >
        <img
        src={logo}
        alt="Logo"
        onClick={() => game.skip()}
        style={{
          height: '15vh',
          marginInline: '0.5em'
        }}
      />

      </Grid>
 
      <Grid xs={1} sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontWeight: "bold",
          fontSize: 64,
          minWidth: '10em'
        }}>
        <div>{game.state.title}</div>
        <MyText isInNav>{game.state.game_name}</MyText>
      </Grid>
 
      <Grid xs={1} sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-end",
          fontWeight: "bold",
          fontSize: 64
        }}>
          <button onClick={() => {console.log(game.state)}}>test</button>

        <div style={{marginInline: '0.5em'}}>{game.state.top_right}</div>
      </Grid>
    </Grid>
  );
}
