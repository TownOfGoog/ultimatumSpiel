import MyButton from "../components/myButton"
import useGameManager from "../service/useGameManager"

export default function Thanks4Playing() {
  const game = useGameManager()
  return (
      <div style={{
        width: '100%', height: '100%', position: 'absolute', top: '50vh', 
        boxShadow: "inset 0 0 0 1px black",
      }}>
        <MyButton onClick={() => game.navigate('/')}>Zurück zum Menü</MyButton>
      </div>
  )
}