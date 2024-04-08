import MyButton from "../components/myButton";
import MyChart from "../components/myChart";
import MyGrid from "../components/myGrid";
import MyText from "../components/myText";
import useGameManager from "../service/useGameManager";

// import { ChartContainer, BarPlot } from '@mui/x-charts';

export default function PlayingHost() {
  const game = useGameManager();
  return (
    
    <MyGrid
      container
      columns={4}
      sx={{ flexGrow: 1, height: "100%", flexWrap: 'nowrap' }}
    >

      <MyGrid xs={2} sx={{ height: "100%", alignContent: 'center' }} container columns={2} >

        <MyGrid xs={2} sx={{ height: "80%", display: 'flex', justifyContent: 'center', alignItems: 'center'}} >
          <MyChart 
            yAxis={ [
              {
                label: 'Anzahl der Angebote',
              },
            ]}
            xAxis={[
              {
                label: 'Angebotenes Geld',
                data: ['0', '10', '20', '30', '40', '50', '60', '70', '80', '90', '100'],
                scaleType: 'band',
              },
            ]}
            series={[
              {
                data: game.offerPerMoneyData, stack: 'a', label: 'Total', color: 'black'
              },
              {
                data: game.offerPerMoneyDataAccepted, stack: 'a', label: 'Angenommen', color: '#0afff7'
              },
              {
                data: game.offerPerMoneyDataDeclined, stack: 'a', label: 'Abgelehnt', color: '#ff8113'
              },
            ]}/>


          {/* <MyChart 
            layout="horizontal"
            grid={{ vertical: true }}
            yAxis={[
              {
                data: ['bar A', 'bar B', 'bar C'],
                scaleType: 'band',
              },
            ]}
            series={[
              {
                data: [2, 5, 3],
              },
            ]}
          /> */}
        </MyGrid>

        <MyGrid xs={2} sx={{ height: "20%", borderTop: '2px solid black', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}} >
          <MyText sx={{marginLeft: '0.5em', marginInline: 'auto'}}>
            {game.playerCount} / {game.totalPlayerCount} Spieler haben {game.isGivingOfferPhase ? 'ein Angebot gegeben.' : 'ein Angebot abgelehnt oder angenommen.'}



          </MyText>

          <MyButton sx={{width: 'auto', padding: '1em', marginRight: '0.5em'}} onClick={() => {game.skip()}}>
            Fortfahren
          </MyButton>
        </MyGrid>
        
      </MyGrid> 
{/*       
      <MyGrid xs={1} sx={{ height: "100%", display: 'flex' }} />
      
      <MyGrid xs={2} sx={{ height: "100%", alignContent: 'center' }} container columns={2} >

        <MyGrid xs={2} sx={{ height: "60%", display: 'flex', justifyContent: 'center', alignItems: 'center'}} >
          <MyText>
            {game.playerCount} / {game.totalPlayerCount} Spieler haben {game.isGivingOfferPhase ? 'ein Angebot gegeben.' : 'ein Angebot abgelehnt oder angenommen.'}
          </MyText>
        </MyGrid>

        <MyGrid xs={2} sx={{ height: "40%", display: 'flex', justifyContent: 'center', alignItems: 'flex-end', padding: '2em'}} >
          <MyText>
            {game.playerCount} / {game.totalPlayerCount} Spieler haben {game.isGivingOfferPhase ? 'ein Angebot gegeben.' : 'ein Angebot abgelehnt oder angenommen.'}
          </MyText>
        </MyGrid>
      </MyGrid> 
      


      <MyGrid xs={1} sx={{ height: "100%", justifyContent: 'flex-end', alignContent: 'flex-end', flexWrap: 'wrap' }} >
        <MyButton sx={{width: 'auto', padding: '1em', margin: '0.5em'}} onClick={() => {game.skip()}}>
          Fortfahren
        </MyButton>
      </MyGrid> */}
    </MyGrid>
  );
}