import MyButton from "../components/myButton";
import MyGrid from "../components/myGrid";
import MyText from "../components/myText";
import useGameManager from "../service/useGameManager";

// import { ChartContainer, BarPlot } from '@mui/x-charts';

export default function PlayingHost() {
  const game = useGameManager();
  
const uData = [4000, 3000, 2000, 2780, 1890, 2390, 3490];
const xLabels = [
  'Page A',
  'Page B',
  'Page C',
  'Page D',
  'Page E',
  'Page F',
  'Page G',
]
  return (
    
    <MyGrid
      container
      columns={4}
      sx={{ flexGrow: 1, height: "100%", flexWrap: 'nowrap' }}
    >

      <MyGrid xs={1} sx={{ height: "100%", display: 'flex' }} />
      
      <MyGrid xs={2} sx={{ height: "100%", alignContent: 'center' }} container columns={2} >

        {/* center part of the screen */}
        <MyGrid xs={2} sx={{ height: "40%", display: 'flex', justifyContent: 'center', alignItems: 'center'}} >
          <MyText>
            {game.playerCount} / {game.totalPlayerCount} Spieler haben {game.isGivingOfferPhase ? 'ein Angebot gegeben.' : 'ein Angebot abgelehnt oder angenommen.'}
          </MyText>
        </MyGrid>
      </MyGrid> 

      <MyGrid xs={1} sx={{ height: "100%", justifyContent: 'flex-end', alignContent: 'flex-end', flexWrap: 'wrap' }} >
        <MyButton sx={{width: 'auto', padding: '1em', margin: '0.5em'}} onClick={() => {game.skip()}}>
          Fortfahren
        </MyButton>
      </MyGrid>
    </MyGrid>
  );
}