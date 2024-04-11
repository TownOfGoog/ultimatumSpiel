import { useState } from "react";
import MyButton from "../components/myButton";
import MyChart from "../components/myChart";
import MyText from "../components/myText";
import useGameManager from "../service/useGameManager";

export default function PlayingHost() {
  const game = useGameManager();
  const [totalView, setTotalView] = useState(false)

  function aggregate_obj_in_arr(arr, obj) {
    let counter = 0
    arr.forEach((element) => {
      counter += element[obj]
    })
    return counter
  }

  function total_answered_offers(objarr) {
    return aggregate_obj_in_arr(objarr, 'accepted') + aggregate_obj_in_arr(objarr, 'declined')
  }

  function calculate_percentage(objarr, amount, answer) {
    return (objarr[amount][answer]) / total_answered_offers(objarr) * 100 || 0
    // return (game.offerPerMoneyTotal[0].accepted) / total_answered_offers(game.offerPerMoneyTotal) * 100
  }

  function pa(amount) {
    // to shorten the graph data
    // p: percentage, a: accepted, d: declined
    return calculate_percentage(game.offerPerMoneyTotal, amount, 'accepted')
  }

  function pd(amount) {
    // to shorten the graph data
    return calculate_percentage(game.offerPerMoneyTotal, amount, 'declined')
  }

  return (
    <div style={{
      height: '100%',
      display: 'flex',
      flexWrap: 'wrap',
      alignContent: 'flex-end'
    }}>
      {/* top part - graphs */}
      {totalView ? 
      //if host clicks on 'total view', show the total view
      <MyChart 
      //players who have answered this offer / totalofferscount * 100
        yAxis={ [
          {
            label: 'Antworten in %',
            // tickMinStep: 1,
          },
        ]}
        xAxis={[
          {
            data: ['0:10', '1:9', '2:8', '3:7', '4:6', '5:5', '6:4', '7:3', '8:2', '9:1', '10:0'],
            scaleType: 'band',
          }
        ]}
        series={[
          {
            data: [ pa(0), pa(1), pa(2), pa(3), pa(4), pa(5), pa(6), pa(7), pa(8), pa(9), pa(10) ], 
            label: 'Angenommene %', color: '#0afff7' //#5eec77 green
          },
          {
            data: [pd(0), pd(1), pd(2), pd(3), pd(4), pd(5), pd(6), pd(7), pd(8), pd(9), pd(10)], 
            label: 'Abgelehnt %', color: '#ff8113'
          },
        ]}
      />
    :
    //if totalView is false, show the normal view
      <>
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
          layout="horizontal"
          grid={{ vertical: true }}
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
            }
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
      </>
    }

      {/* bottom part - buttons */}
      <div style={{
        width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', 
        borderTop: '2px solid black', //black line
        padding: '0.5em', gap: '0.5em', //space between buttons
      }}>

        {/* upper half - current game controls */}
        <div style={{width: '100%', display: 'flex', gap: '0.5em'}}>
          <MyText sx={{marginInline: 'auto', alignContent: 'center'}}>
            {
              game.offerPhase === 'make_offer'
              ? 
              `${game.playerCount} / ${game.totalPlayerCount} Spieler haben ein Angebot gegeben.`
              : 
              game.offerPhase === 'answer_offer'
              ? 
              `${game.playerCount} / ${game.totalPlayerCount} Spieler haben ein Angebot abgelehnt oder angenommen.`
              :
              'Alle haben geantwortet.'
            }
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
            <MyButton sx={{width: 'auto', padding: '0.8em'}} onClick={() => {game.skip()}}>
              Fortfahren
            </MyButton>
          }
        </div>
        
        {/* lower half - current lobby controls */}
        <div style={{width: '100%', display: 'flex', justifyContent: 'flex-end', gap: '0.5em'}}>
          {game.offerPhase === 'wait' &&
            //only when everyone has answered, show the close button
            <MyButton disabled sx={{width: 'auto', padding: '0.8em'}} onClick={() => {game.skip()}}>
              Beenden
            </MyButton>
          }

          {totalView && 
            // only when total view is active, show the download button
            <MyButton disabled sx={{width: 'auto', padding: '0.8em'}} onClick={() => {
                            // Acquire Data (reference to the HTML table)

              // // Extract Data (create a workbook object from the table)
              // var workbook = XLSX.utils.json_to_sheet({test: 1, test2: 3});

              // // Process Data (add a new row)
              // var ws = workbook.Sheets["Sheet1"];
              // XLSX.utils.sheet_add_aoa(ws, [["Created "+new Date().toISOString()]], {origin:-1});

              // // Package and Release Data (`writeFile` tries to write and save an XLSB file)
              // XLSX.writeFile(workbook, "Report.xlsb");
            }}>
              Herunterladen
            </MyButton>
          }

          <MyButton sx={{width: 'auto', padding: '0.8em'}} onClick={() => {setTotalView((prev) => !prev)}}>
            {!totalView ? 'Totale' : 'Normale'} Ansicht
          </MyButton>
          {/* <button onClick={() => {console.log(game.offerPerMoney)}}>test</button> */}
        </div>
      </div>
    </div>
  );
}