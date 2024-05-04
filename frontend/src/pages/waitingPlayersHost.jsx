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
    <div style={{
      width: '100%', height: '100%',
      display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
      gap: '8vh',
    }}
    >
      <MyText fontSize="3em" >
        <Link style={{ color: 'black' }} target="_blank" to={window.location.href}>https://ultimatum-spiel.onrender.com/lobby/73038</Link>
      </MyText>
      <div style={{
        width: '100%',
        display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        gap: '20vw',
      }}>
        <div>
          <MyText fontSize="2.5em" sx={{marginBottom: '-20px'}}>
            Der Code:
          </MyText>
          <MyText fontSize="5em">
            {game.state.code}
          </MyText>
        </div>
        <QRCode value={window.location.href} size={200} />
      </div>
      <MyText fontSize="2.5em">
        Spieler: {game.state.total_player_count}
      </MyText>
      <div style={{
        position: 'absolute',
        bottom: '1vh',
        right: '1vh',
        // bottom: '5vh',
        // right: '5vw',
      }}>
        <MyButton disabled={game.state.total_player_count <= 0} sx={{width: 'auto', padding: '1em', margin: '0.5em'}} onClick={() => game.new_game(game.state.game_name)}>
          Starten
        </MyButton>
      </div>
    </div>
  );
}
