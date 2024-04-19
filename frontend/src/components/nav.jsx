import Grid from "@mui/joy/Grid";
import logo from "../assets/logo.png"
import useGameManager from "../service/useGameManager";
import MyText from "./myText";
import MyButton from "./myButton";

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
        }}>
          <button onClick={() => {
            fetch('http://localhost:8080/test', {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json'
              },
              credentials: 'include',
            }).then(
              res => res.text()
            ).then(
              text => console.log(text)
            )
          }}>text</button>
          <button onClick={() => {console.log(game.state)}}>is_logged_in</button>

        <div style={{marginInline: '0.8em'}}>{game.state.top_right}</div>
      </Grid>
    </Grid>
  );
}
