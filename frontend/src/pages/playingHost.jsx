import { useState } from "react";
import MyButton from "../components/myButton";
import MyChart from "../components/myChart";
import MyText from "../components/myText";
import useGameManager from "../service/useGameManager";
import * as XLSX from 'xlsx';

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
        dataset={game.offerPerMoneyTotalPercent}
        yAxis={ [
          {
            label: 'Antworten in %',
            // valueFormatter: (value) => `${value}%`,
          },
        ]}
        xAxis={[
          {
            label: 'Angebote',
            dataKey: 'amount',
            scaleType: 'band',
          }
        ]}
        series={[
          {
            dataKey: 'accepted',
            label: 'Angenommen', color: '#0afff7' //#5eec77 green
          },
          {
            dataKey: 'declined',
            label: 'Abgelehnt', color: '#ff8113'
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
            <MyButton sx={{width: 'auto', padding: '0.8em'}} onClick={() => {game.new_game(prompt('Name des neuen Spieles'))}}>
              Neues Spiel
            </MyButton>
            <MyButton sx={{width: 'auto', padding: '0.8em'}} onClick={() => {game.new_round()}}>
              Neue Runde
            </MyButton>
          </>
          :
            <MyButton disabled={game.playerCount === 0} sx={{width: 'auto', padding: '0.8em'}} onClick={() => {game.skip()}}>
              Fortfahren
            </MyButton>
          }
        </div>
        
        {/* lower half - current lobby controls */}
        <div style={{width: '100%', display: 'flex', justifyContent: 'flex-end', gap: '0.5em'}}>
          {game.offerPhase === 'wait' &&
            //only when everyone has answered, show the close button
            <MyButton sx={{width: 'auto', padding: '0.8em'}} onClick={() => {game.skip()}}>
              Beenden
            </MyButton>
          }

          {totalView && 
            // only when total view is active, show the download button
            <MyButton sx={{width: 'auto', padding: '0.8em'}} onClick={() => {
              console.log('game.offerPerMoneyTotalPercent: ', game.offerPerMoneyTotalPercent);
              const rows = game.offerPerMoneyTotal.map((row, index) => ({
                Geld: row.amount,
                Angenommen: row.accepted,
                Abgelehnt: row.declined,
                AbsolutAngenommen: game.offerPerMoneyTotalPercent[index].accepted,
                AbsolutAbgelehnt: game.offerPerMoneyTotalPercent[index].declined,
              }));
              const worksheet = XLSX.utils.json_to_sheet(rows);
              //set column width
              worksheet["!cols"] = [ { width: 5 }, { width: 12 }, { width: 9 }, { width: 19 }, { width: 16 } ];
              const workbook = XLSX.utils.book_new();
              XLSX.utils.book_append_sheet(workbook, worksheet, game.topRight || 'Namenlose Lobby'); //topright is our class
              
              XLSX.writeFile(workbook, "Presidents.xlsx");
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