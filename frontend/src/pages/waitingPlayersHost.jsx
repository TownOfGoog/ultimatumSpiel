// import { Grid } from '@mui/joy';
import Grid from '../components/myGrid';

import QRCode from 'react-qr-code';
import useGameManager from '../service/useGameManager';
import MyText from '../components/myText';
import MyButton from '../components/myButton';
import { Link } from 'react-router-dom';

export default function WaitingPlayersHost() {
  const game = useGameManager();

  return (
    <Grid
      container
      columns={4}
      sx={{ flexGrow: 1, height: "100%", flexWrap: 'nowrap', border: "1px solid black", }}
    >

      <Grid xs={1} sx={{ height: "100%", display: 'flex' }} />
      
      <Grid xs={2} sx={{ height: "100%", alignContent: 'flex-start' }} container columns={2} >

        {/* top center part of the screen */}
        <Grid xs={2} sx={{ height: "20%", display: 'flex', alignItems: 'center', justifyContent: 'center' }} >
          <MyText level="h1" fontSize="3em" >
            <Link style={{color:'black'}} target="_blank" to={window.location.href}>{window.location.href}</Link>
          </MyText>
        </Grid>

        {/* left center part of the screen */}
        <Grid xs={1} sx={{ height: "40%", display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }} >
          <MyText fontSize="2.5em" sx={{marginBottom: '-20px'}}>
            Der Code:
          </MyText>
          <MyText fontSize="5em">
            {game.state.code}
          </MyText>
        </Grid>

        {/* right center part of the screen */}
        <Grid xs={1} sx={{ height: "40%", display: 'flex', justifyContent: 'center', alignItems: 'center' }} >
          <QRCode value={window.location.href} size={200} />
        </Grid>

        {/* bottom center part of the screen */}
        <Grid xs={2} sx={{ height: "40%", display: 'flex', justifyContent: 'center'}} >
          <MyText fontSize="2.5em">
            Spieler: {game.state.total_player_count}
          </MyText>
        </Grid>
      </Grid> 

      <Grid xs={1} sx={{ height: "100%", justifyContent: 'flex-end', alignContent: 'flex-end', flexWrap: 'wrap' }} >
        <MyButton disabled={game.state.total_player_count <= 0} sx={{width: 'auto', padding: '1em', margin: '0.5em'}} onClick={() => game.new_game(game.state.game_name)}>
          Starten
        </MyButton>
      </Grid>
    </Grid>
  );
}
