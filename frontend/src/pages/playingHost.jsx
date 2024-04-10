import MyButton from "../components/myButton";
import MyChart from "../components/myChart";
import MyGrid from "../components/myGrid";
import MyText from "../components/myText";
import useGameManager from "../service/useGameManager";

// import { ChartContainer, BarPlot } from '@mui/x-charts';

export default function PlayingHost() {
  const game = useGameManager();

  function aggregate_obj_in_arr(arr, obj) {
    let counter = 0
    arr.forEach((element) => {
      counter += element[obj]
    })
    return counter
  }
  return (
    
    <MyGrid
      container
      columns={4}
      sx={{ flexGrow: 1, height: "100%", flexWrap: 'nowrap' }}
    >

      <MyGrid xs={2} sx={{ height: "100%", alignContent: 'center' }} container columns={2} >
        <MyGrid xs={2} sx={{ height: "80%", display: 'flex', justifyContent: 'center', alignItems: 'center'}} >
          <MyChart 
            dataset={game.offerPerMoney}
            yAxis={ [
              {
                label: 'Anzahl der Angebote',
                tickMinStep: 1,
              },
            ]}
            xAxis={[
              {
                dataKey: 'amount',
                scaleType: 'band',
              }
            ]}
            series={[
              {
                dataKey: 'open', stack: 'a', label: 'Offene Angebote', color: 'black'
              },
              {
                dataKey: 'accepted', stack: 'a', label: 'Angenommen', color: '#0afff7' //#5eec77 green
              },
              {
                dataKey: 'declined', stack: 'a', label: 'Abgelehnt', color: '#ff8113'
              }
            ]}
          />


          <MyChart 
            sx={{zIndex: 1}}
            layout="horizontal"
            grid={{ vertical: true }}
            dataset={game.offerPerMoney}            
            xAxis={[
              {
                label: 'Angebotenes Geld',
                tickMinStep: 1,
              },
            ]}
            yAxis={[
              {
                data: ['Angebote angenommen', 'Angebote abgelehnt', 'Anzahl Spieler'],
                scaleType: 'band',
              },
            ]}
            series={[
              {
                data: [null, null, game.totalPlayerCount - aggregate_obj_in_arr(game.offerPerMoney, 'open')], stack: 'a', label: 'Anzahl Spieler', color: 'black'
              },
              {
                data: [null, null, aggregate_obj_in_arr(game.offerPerMoney, 'open')], stack: 'a', label: 'Anzahl Angeboten', color: '#555E68'
              },
              {
                data: [aggregate_obj_in_arr(game.offerPerMoney, 'accepted'), null, null], stack: 'a', label: 'Angenommen', color: '#0afff7' 
              },
              {
                data: [null, aggregate_obj_in_arr(game.offerPerMoney, 'declined'), null], stack: 'a', label: 'Abgelehnt', color: '#ff8113'
              },
            ]}
          />
        </MyGrid>

        <MyGrid xs={2} sx={{ height: "20%", borderTop: '2px solid black', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}} >
          <MyText sx={{marginLeft: '0.5em', marginInline: 'auto'}}>
            {game.offerPhase === 'make_offer' ? `${game.playerCount} / ${game.totalPlayerCount} Spieler haben ein Angebot gegeben.` : game.offerPhase === 'answer_offer' ? `${game.playerCount} / ${game.totalPlayerCount} Spieler haben ein Angebot abgelehnt oder angenommen.` : 'Alle haben geantwortet.'}
          </MyText>

            {game.offerPhase === 'wait' ? 
            //when everyone has given their answer
            <>
              <MyButton sx={{width: 'auto', padding: '1em', marginRight: '0.5em'}} onClick={() => {game.new_game()}}>
                Neues Spiel
              </MyButton>
              <MyButton sx={{width: 'auto', padding: '1em', marginRight: '0.5em'}} onClick={() => {game.new_round()}}>
                Neue Runde
              </MyButton>
            </>
            :
            <MyButton sx={{width: 'auto', padding: '1em', marginRight: '0.5em'}} onClick={() => {game.skip()}}>
              Fortfahren
            </MyButton>}
            <button onClick={() => {console.log(game.offerPhase, game.offerPerMoney)}}>test</button>
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