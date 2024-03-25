// import { Grid } from '@mui/joy';
import Grid from '../components/myGrid';

import Typography from '@mui/joy/Typography';
import QRCode from 'react-qr-code';
import useGameManager from '../service/useGameManager';

export default function WaitingPlayersHost({ code }) {
  const game = useGameManager();

  return (
    <Grid
      container
      columns={4}
      sx={{ flexGrow: 1, height: "100%", flexWrap: 'nowrap' }}
    >

      <Grid xs={1} sx={{ height: "100%", display: 'flex', backgroundColor: 'red' }} />
      
      <Grid xs={2} sx={{ height: "100%", alignContent: 'flex-start' }} container columns={2} >

        {/* top center part of the screen */}
        <Grid xs={2} sx={{ height: "20%", display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'blue' }} >
          <Typography level="h1" fontSize="3em" sx={{textDecoration: 'underline'}} >
            {window.location.href}
          </Typography>
        </Grid>

        {/* left center part of the screen */}
        <Grid xs={1} sx={{ height: "40%", display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: 'pink' }} >
          <Typography level="title-sm" fontSize="2.5em" sx={{marginBottom: '-20px'}}>
            Der Code:
          </Typography>
          <Typography level="h1" fontSize="5em">
            {code}
          </Typography>
        </Grid>

        {/* right center part of the screen */}
        <Grid xs={1} sx={{ height: "40%", display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: 'green' }} >
          <QRCode value={window.location.href} size={200} xlinkTitle="test" />
        </Grid>

        {/* bottom center part of the screen */}
        <Grid xs={2} sx={{ height: "40%", display: 'flex', justifyContent: 'center'}} >
          <Typography>
            Spieler: {game.state.player_count}
          </Typography>
          <button onClick={() => {console.log(game.state)}}>state logger</button>
        </Grid>
      </Grid> 

      <Grid xs={1} sx={{ height: "100%", backgroundColor: 'red' }} />
    </Grid>
  );
}
