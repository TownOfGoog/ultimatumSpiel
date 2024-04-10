import MyButton from "../components/myButton";
import MyChart from "../components/myChart";
import MyText from "../components/myText";
import useGameManager from "../service/useGameManager";

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
    <div style={{
      height: '100%',
      display: 'flex',
      flexWrap: 'wrap',
      alignContent: 'flex-end'
    }}>
      {/* top part - graphs */}
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
            dataKey: 'accepted', stack: 'a', label: 'Angenommen', color: '#0afff7' //#5eec77 green
          },
          {
            dataKey: 'declined', stack: 'a', label: 'Abgelehnt', color: '#ff8113'
          },
          {
            dataKey: 'open', stack: 'a', label: 'Offene Angebote', color: 'black'
          },
        ]}
      />

      <MyChart 
        sx={{zIndex: 1}}
        layout="horizontal"
        grid={{ vertical: true }}
        dataset={game.offerPerMoney}            
        xAxis={[
          {
            label: 'Anzahl Spieler',
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
            data: [aggregate_obj_in_arr(game.offerPerMoney, 'accepted'), 0, 0], stack: 'a', label: 'Angenommen', color: '#0afff7' 
          },
          {
            data: [0, aggregate_obj_in_arr(game.offerPerMoney, 'declined'), 0], stack: 'a', label: 'Abgelehnt', color: '#ff8113'
          },
          {
            data: [0, 0, game.totalPlayerCount - aggregate_obj_in_arr(game.offerPerMoney, 'open')], stack: 'a', label: 'Spieler', color: 'black'
          },
          {
            data: [0, 0, aggregate_obj_in_arr(game.offerPerMoney, 'open')], stack: 'a', label: 'Angeboten', color: '#555E68'
          },
        ]}
      />

      {/* bottom part - buttons */}
      <div style={{
        width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', 
        borderTop: '2px solid black', //black line
        padding: '0.5em', gap: '0.5em', //space between buttons
      }}>

        {/* upper half - current game controls */}
        <div style={{width: '100%', display: 'flex', gap: '0.5em'}}>
          <MyText sx={{marginInline: 'auto', alignContent: 'center'}}>
            {game.offerPhase === 'make_offer' ? `${game.playerCount} / ${game.totalPlayerCount} Spieler haben ein Angebot gegeben.` : game.offerPhase === 'answer_offer' ? `${game.playerCount} / ${game.totalPlayerCount} Spieler haben ein Angebot abgelehnt oder angenommen.` : 'Alle haben geantwortet.'}
          </MyText>
          {game.offerPhase === 'wait' ?
          //when everyone has given their answer, show buttons to continue game
          <>
            <MyButton sx={{width: 'auto', padding: '0.8em'}} onClick={() => {game.new_game()}}>
            Neues Spiel
            </MyButton>
            <MyButton sx={{width: 'auto', padding: '0.8em'}} onClick={() => {game.new_round()}}>
            Neue Runde
            </MyButton>
          </>
          :
            <MyButton disabled sx={{width: 'auto', padding: '0.8em'}} onClick={() => {game.skip()}}>
              Fortfahren
            </MyButton>
          }
        </div>
        
        {/* lower half - current lobby controls */}
        <div style={{width: '100%', display: 'flex', justifyContent: 'flex-end', gap: '0.5em'}}>
          <MyButton disabled sx={{width: 'auto', padding: '0.8em'}} onClick={() => {game.skip()}}>
            Beenden
          </MyButton>
          <MyButton disabled sx={{width: 'auto', padding: '0.8em'}} onClick={() => {game.skip()}}>
            Herunterladen
          </MyButton>
          <MyButton disabled sx={{width: 'auto', padding: '0.8em'}} onClick={() => {game.skip()}}>
            Totale Ansicht
          </MyButton>
        </div>
      </div>
    </div>
    // <MyGrid
    //   container
    //   columns={4}
    //   sx={{ flexGrow: 1, flexWrap: 'nowrap' }}
    // >

    //   <MyGrid xs={2} sx={{alignContent: 'center' }} container columns={2} >
    //     <MyGrid xs={2} sx={{display: 'flex', justifyContent: 'center', alignItems: 'flex-end'
    //     // , padding: '10px'
    //     }} >
    //      
    //     </MyGrid>

    //     {/* bottom part - indicated by black line */}
    //     <MyGrid container columns={2} xs={2} sx={{ borderTop: '2px solid black', display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBlock: '1em'}} >
    //       {/* top half */}
    //       <MyGrid xs={2} sx={{alignItems: 'center', justifyContent: 'flex-end'}}>
    //         <MyButton sx={{width: 'auto', padding: '0.8em', marginRight: '0.4em'}} onClick={() => {game.skip()}}>
    //           Beenden
    //         </MyButton>
    //         <MyButton sx={{width: 'auto', padding: '0.8em', marginRight: '0.4em'}} onClick={() => {game.skip()}}>
    //           Totale anzeigen
    //         </MyButton>
    //       </MyGrid>
    //       <MyGrid xs={2} sx={{alignItems: 'center'}}>

    //         {/* bottom half */}
            
    //         {/* <button onClick={() => {console.log(game.offerPhase, game.offerPerMoney)}}>test</button> */}
    //       </MyGrid>
    //     </MyGrid>
    //   </MyGrid> 
    // </MyGrid>
  );
}