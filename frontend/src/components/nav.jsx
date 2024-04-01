import Grid from "@mui/joy/Grid";
import logo from "../assets/logo.png"
import useGameManager from "../service/useGameManager";

export default function Nav({ title }) {
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
        style={{
          height: '15vh',
          marginInline: '0.5em'
        }}
      />

      </Grid>
 
      <Grid xs={1} sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontWeight: "bold",
          fontSize: 64
        }}>
        <div>{title}</div>
      </Grid>
 
      <Grid xs={1} sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-end",
          fontWeight: "bold",
          fontSize: 64
        }}>
        <div style={{marginInline: '0.5em'}}>{game.topRight}</div>
      </Grid>
    </Grid>
  );
}
