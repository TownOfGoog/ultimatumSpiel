import ReactLoading from "react-loading";
import MyText from "../components/myText";
import useGameManager from "../service/useGameManager";

export default function WaitingPlayers() {
  const game = useGameManager();
  return (
    <div style={{
      width: '100%', height: '100%', 
      display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: '10vh'
    }}
    >
      {game.state.is_previous_offer_accepted !== undefined && (
        <MyText>Dein vorheriges Angebot (<MyText bold>{game.state.last_offer}</MyText>) wurde <MyText bold>{game.state.is_previous_offer_accepted ? 'Akzeptiert' : 'Abgelehnt'}</MyText>.</MyText>
      )}

      {/* center loading circles */}
      <div style={{
        width: '16vw', maxWidth: '15em', height: "16vw",
        display: 'flex', alignItems: 'center'
        }}>
        <ReactLoading 
        type={"spinningBubbles"}
        color={"black"}
        width={"100%"}
        />
      </div>

      <MyText>{game.state.is_previous_offer_accepted !== undefined ? 'Warte auf nächste Runde...' : 'Warte auf anderen Spieler...'}</MyText>
    </div>
  );
}
