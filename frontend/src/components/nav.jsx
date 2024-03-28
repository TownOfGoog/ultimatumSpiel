import Grid from "@mui/joy/Grid";
import logo from "../assets/logo.png"

export default function Nav({ title }) {
  return (
    <Grid container columns={{ xs: 3 }} sx={{ flexGrow: 1, bgcolor: "black", color: "white", height: "100%", flexWrap: "nowrap" }}>
      <Grid
        xs={1} sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <img
        src={logo}
        alt="Logo"
        style={{
          height: '15vh',
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
    </Grid>
  );
}
