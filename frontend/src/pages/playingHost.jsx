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
      alignItems: 'flex-end',
    }}>
      {/* top part - graphs */}
      {totalView ?
      //#region Total Chart 
      //if host clicks on 'total view', show the total view
      <>
        <MyChart 
        //players who have answered this offer / totalofferscount * 100
        dataset={game.state.offer_per_money_total_percent[0]}
        label={'test'}
        yAxis={ [
          {
            label: 'Antworten in %',
            // valueFormatter: (value) => `${value}%`,
          },
        ]}
        xAxis={[
          {
            label: 'Totale Angebote',
            dataKey: 'amount',
            scaleType: 'band',
          }
        ]}
        series={[
          {
            dataKey: 'accepted',
            label: 'Angenommen', stack: 'a', color: '#0afff7' //#5eec77 green
          },
          {
            dataKey: 'declined',
            label: 'Abgelehnt', stack: 'a', color: '#ff8113'
          },
        ]}
        />
        <MyChart 
        //players who have answered this offer / totalofferscount * 100
          dataset={game.state.offer_per_money_total_percent[game.state.offer_per_money_total_percent.length - 1]}
          label={'test'}
          yAxis={ [
            {
              label: 'Antworten in %',
              // valueFormatter: (value) => `${value}%`,
            },
          ]}
          xAxis={[
            {
              label: `Totale Angebote vom Spiel ${game.state.current_game}`,
              dataKey: 'amount',
              scaleType: 'band',
            }
          ]}
          series={[
            {
              dataKey: 'accepted',
              label: 'Angenommen', stack: 'a', color: '#0afff7' //#5eec77 green
            },
            {
              dataKey: 'declined',
              label: 'Abgelehnt', stack: 'a', color: '#ff8113'
            },
          ]}
        />
      </>
    :
    //#region Relative Chart
    //if totalView is false, show the normal view
      <>
        <MyChart 
          dataset={game.state.offer_per_money}
          yAxis={ [
            {
              label: 'Anzahl der Angebote',
              tickMinStep: 1,
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
        {game.state.total_player_count !== Infinity && 
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
                data: [aggregate_obj_in_arr(game.state.offer_per_money, 'accepted'), 0, 0], stack: 'a', label: 'Angenommen', color: '#0afff7' 
              },
              {
                data: [0, aggregate_obj_in_arr(game.state.offer_per_money, 'declined'), 0], stack: 'a', label: 'Abgelehnt', color: '#ff8113'
              },
              {
                data: [0, 0, game.state.total_player_count - aggregate_obj_in_arr(game.state.offer_per_money, 'open') ], stack: 'a', label: 'Spieler', color: 'black'
              },
              {
                data: [0, 0, aggregate_obj_in_arr(game.state.offer_per_money, 'open')], stack: 'a', label: 'Angeboten', color: '#555E68'
              },
            ]}
          />
        }
      </>
    }

      {/* bottom part - buttons */}
      <div style={{
        //#region Buttons
        width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', alignSelf: 'flex-end',
        borderTop: '2px solid black', //black line
        padding: '0.5em', gap: '0.5em', //space between buttons
      }}>

        {/* upper half - current game controls */}
        <div style={{width: '100%', display: 'flex', gap: '0.5em'}}>
          <MyText sx={{marginInline: 'auto', alignContent: 'center'}}>
            {
              game.state.offer_phase === 'make_offer' ? 
              `${game.state.player_count} / ${game.state.total_player_count} Spieler haben ein Angebot gegeben.`
              
              : game.state.offer_phase === 'answer_offer' ? 
              `${game.state.player_count} / ${game.state.total_player_count} Spieler haben ein Angebot abgelehnt oder angenommen.`
              
              : game.state.exit ? 
              'Spiel beendet.'
              : 'Alle haben geantwortet.'
            }
          </MyText>
          {!game.state.exit && 
            <>
            {game.state.offer_phase === 'wait' ?
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
              <MyButton disabled={game.state.player_count === 0} sx={{width: 'auto', padding: '0.8em'}} onClick={() => {game.skip()}}>
                  Fortfahren
              </MyButton>
            }
            </>
          }
        </div>
        
        {/* lower half - current lobby controls */}
        <div style={{width: '100%', display: 'flex', justifyContent: 'flex-end', gap: '0.5em'}}>
          {game.state.offer_phase === 'wait' && !game.state.exit &&
            //only when everyone has answered, show the close button
            <MyButton sx={{width: 'auto', padding: '0.8em'}} onClick={() => {game.exit()}}>
              Beenden
            </MyButton>
          }
          {game.state.exit &&
            //only when the game is finished, show the new game button
            <MyButton sx={{width: 'auto', padding: '0.8em'}} onClick={() => {game.return_to_menu()}}>
              Zurück zum Menü
            </MyButton>
          }

          {totalView && 
            //#region Excel logic
            // only when total view is active, show the download button
            <MyButton sx={{width: 'auto', padding: '0.8em'}} onClick={() => {
              console.log('game.offerPerMoneyTotalPercent: ', game.state.offer_per_money_total_percent);
              console.log('game names:', game.state.game_names)
              const workbook = XLSX.utils.book_new();
              console.log('was it possible to create new book without rows?');
              //game_names has the same length as offer_per_money_total and _percent, always.
              game.state.game_names.forEach((element, i) => {
                console.log('game.state.offer_per_money_total[i]: ', game.state.offer_per_money_total[i]);
                const rows = game.state.offer_per_money_total[i].map((row, index) => ({
                  Geld: row.amount,
                  Angenommen: game.state.offer_per_money_total_percent[i][index].accepted,
                  Abgelehnt: game.state.offer_per_money_total_percent[i][index].declined,
                  AbsolutAngenommen: row.accepted,
                  AbsolutAbgelehnt: row.declined,
                }));

                const worksheet = XLSX.utils.json_to_sheet(rows);
                //set column width
                worksheet["!cols"] = [ { width: 5 }, { width: 12 }, { width: 9 }, { width: 19 }, { width: 16 } ];
                XLSX.utils.book_append_sheet(
                  workbook, 
                  worksheet, 
                  i === 0 ? 'Alle Spiele Total' : `Spiel ${i}`
                ); //topright is our class

                //add scenario to the end of the sheet
                XLSX.utils.sheet_add_aoa(worksheet, [[i === 0 ? "Alle Spiele Total" : "Szenario: " + element || 'Keins.']], {origin: -1});
              })

              //write file with name of the lobby + current date
              XLSX.writeFile(workbook, `${game.state.top_right} ${new Date().toISOString().slice(0, 10)}.xlsx`.trim());
            }}>
              Herunterladen
            </MyButton>
          }

          <MyButton sx={{width: 'auto', padding: '0.8em'}} onClick={() => {setTotalView((prev) => !prev)}}>
            {!totalView ? 'Totale' : 'Normale'} Ansicht
          </MyButton>
        </div>
      </div>
    </div>
  );
}