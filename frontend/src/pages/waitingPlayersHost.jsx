// import { Grid } from '@mui/joy';
import Grid from '../components/myGrid';

import QRCode from 'react-qr-code';
import useGameManager from '../service/useGameManager';
import MyText from '../components/myText';
import MyButton from '../components/myButton';

export default function WaitingPlayersHost() {
  const game = useGameManager();

  return (
    <Grid
      container
      columns={4}
      sx={{ flexGrow: 1, height: "100%", flexWrap: 'nowrap' }}
    >

      <Grid xs={1} sx={{ height: "100%", display: 'flex' }} />
      
      <Grid xs={2} sx={{ height: "100%", alignContent: 'flex-start' }} container columns={2} >

        {/* top center part of the screen */}
        <Grid xs={2} sx={{ height: "20%", display: 'flex', alignItems: 'center', justifyContent: 'center' }} >
          <MyText level="h1" fontSize="3em" sx={{textDecoration: 'underline'}} >
            {window.location.href}
          </MyText>
        </Grid>

        {/* left center part of the screen */}
        <Grid xs={1} sx={{ height: "40%", display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }} >
          <MyText level="title-sm" fontSize="2.5em" sx={{marginBottom: '-20px'}}>
            Der Code:
          </MyText>
          <MyText level="h1" fontSize="5em">
            {game.code}
          </MyText>
        </Grid>

        {/* right center part of the screen */}
        <Grid xs={1} sx={{ height: "40%", display: 'flex', justifyContent: 'center', alignItems: 'center' }} >
          <QRCode value={window.location.href + 'lobby/' + game.code} size={200} />
        </Grid>

        {/* bottom center part of the screen */}
        <Grid xs={2} sx={{ height: "40%", display: 'flex', justifyContent: 'center'}} >
          <MyText>
            Spieler: {game.playerCount }
          </MyText>
        </Grid>
      </Grid> 

      <Grid xs={1} sx={{ height: "100%", justifyContent: 'flex-end', alignContent: 'flex-end', flexWrap: 'wrap' }} >
        <MyButton sx={{width: 'auto', padding: '1em', margin: '0.5em'}} onClick={game.start_game}>
          Starten
        </MyButton>
      </Grid>
    </Grid>
  );
}
