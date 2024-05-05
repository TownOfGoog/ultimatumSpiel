import MyButton from "../components/myButton"
import useGameManager from "../service/useGameManager"

export default function Thanks4Playing() {
  const game = useGameManager()
  return (
    <div style={{
      width: '100%', height: '100%', position: 'relative',
      boxShadow: "inset 0 0 0 1px black",
    }}>
      <div style={{
        position: 'absolute',
        width: '90%', maxWidth: '800px',
        top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
      }}>
        <MyButton shouldFillAll  onClick={() => game.navigate('/')}>Zurück zum Menü</MyButton>
      </div>
    </div>
  )
}